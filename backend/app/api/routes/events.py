from app.services.energy import estimate_energy_cost
from datetime import timedelta

from fastapi import APIRouter, HTTPException, status
from pydantic import AwareDatetime
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.models import Event
from app.schemas.event import EventCreate, EventRead, EventUpdate
from app.core.energy_rates import RATES_PER_HOUR

router = APIRouter(prefix="/api/events", tags=["events"])

MAX_RANGE = timedelta(days=92)


async def get_owned_event(db: DbSession, event_id: int, user: CurrentUser) -> Event:
    """Load an event that belongs to the user, or raise 404."""
    event = await db.scalar(
        select(Event).where(Event.id == event_id, Event.owner_id == user.id)
    )
    if event is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Event not found")
    return event


@router.get("", response_model=list[EventRead])
async def list_events(start: AwareDatetime, end: AwareDatetime, user: CurrentUser, db: DbSession):
    """List the current user's events that overlap the given time range."""
    if start >= end:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "start must be before end")
    if end - start > MAX_RANGE:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Range cannot exceed 92 days")

    events = await db.scalars(
        select(Event)
        .where(
            Event.owner_id == user.id,
            Event.starts_at < end,
            Event.ends_at > start,
        )
        .order_by(Event.starts_at)
    )
    return list(events)


@router.get("/categories")
async def list_categories(user: CurrentUser):
    """Energy rate per hour for each event category."""
    return [{"category": c, "rate_per_hour": r} for c, r in RATES_PER_HOUR.items()]


@router.post("", response_model=EventRead, status_code=status.HTTP_201_CREATED)
async def create_event(data: EventCreate, user: CurrentUser, db: DbSession):
    """Create an event; energy is calculated unless an override is given."""
    event = Event(**data.model_dump(exclude={"energy_cost"}), owner_id=user.id)

    if data.energy_cost is None:
        event.energy_cost = estimate_energy_cost(event.category, event.starts_at, event.ends_at)
        event.energy_cost_manual = False
    else:
        event.energy_cost = data.energy_cost
        event.energy_cost_manual = True

    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event


@router.get("/{event_id}", response_model=EventRead)
async def get_event(event_id: int, user: CurrentUser, db: DbSession):
    """Get one of the current user's events."""
    return await get_owned_event(db, event_id, user)


@router.patch("/{event_id}", response_model=EventRead)
async def update_event(event_id: int, data: EventUpdate, user: CurrentUser, db: DbSession):
    """Update only the fields that were sent, recalculating energy unless overridden."""
    event = await get_owned_event(db, event_id, user)

    changes = data.model_dump(exclude_unset=True)
    changes.pop("energy_cost", None)
    for field, value in changes.items():
        setattr(event, field, value)

    if "energy_cost" in data.model_fields_set:
        if data.energy_cost is None:
            event.energy_cost_manual = False
        else:
            event.energy_cost = data.energy_cost
            event.energy_cost_manual = True

    if event.ends_at <= event.starts_at:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "ends_at must be after starts_at")

    if not event.energy_cost_manual:
        event.energy_cost = estimate_energy_cost(event.category, event.starts_at, event.ends_at)

    await db.commit()
    await db.refresh(event)
    return event


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(event_id: int, user: CurrentUser, db: DbSession):
    """Delete one of the current user's events."""
    event = await get_owned_event(db, event_id, user)
    await db.delete(event)
    await db.commit()
