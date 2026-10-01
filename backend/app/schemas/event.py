from datetime import datetime
from typing import Self

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, model_validator

from app.core.energy_rates import MAX_EVENT_COST, MIN_EVENT_COST, EventCategory


class EventBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    notes: str | None = None
    starts_at: AwareDatetime
    ends_at: AwareDatetime
    category: EventCategory = EventCategory.OTHER
    rrule: str | None = Field(default=None, max_length=500)

    @model_validator(mode="after")
    def check_times(self) -> Self:
        if self.ends_at <= self.starts_at:
            raise ValueError("ends_at must be after starts_at")
        return self


class EventCreate(EventBase):
    # None = calculate automatically; a number = manual override
    energy_cost: int | None = Field(default=None, ge=MIN_EVENT_COST, le=MAX_EVENT_COST)


class EventUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    notes: str | None = None
    starts_at: AwareDatetime | None = None
    ends_at: AwareDatetime | None = None
    category: EventCategory | None = None
    # null = switch back to automatic; a number = manual override
    energy_cost: int | None = Field(default=None, ge=MIN_EVENT_COST, le=MAX_EVENT_COST)
    rrule: str | None = Field(default=None, max_length=500)

    @model_validator(mode="after")
    def check_fields(self) -> Self:
        for field in ("title", "starts_at", "ends_at", "category"):
            if field in self.model_fields_set and getattr(self, field) is None:
                raise ValueError(f"{field} cannot be null")

        if self.starts_at and self.ends_at and self.ends_at <= self.starts_at:
            raise ValueError("ends_at must be after starts_at")
        return self


class EventRead(EventBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    energy_cost: int
    energy_cost_manual: bool
    created_at: datetime
    updated_at: datetime
