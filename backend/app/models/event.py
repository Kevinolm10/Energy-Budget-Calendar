from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, String, Text, false, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base
from app.core.energy_rates import MAX_EVENT_COST, MIN_EVENT_COST

if TYPE_CHECKING:
    from app.models.user import User


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(primary_key=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(200))
    notes: Mapped[str | None] = mapped_column(Text)
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    category: Mapped[str] = mapped_column(String(20), default="other", server_default="other")
    energy_cost: Mapped[int] = mapped_column(default=0)
    energy_cost_manual: Mapped[bool] = mapped_column(default=False, server_default=false())
    rrule: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    owner: Mapped["User"] = relationship(back_populates="events")

    __table_args__ = (
        CheckConstraint(
            f"energy_cost BETWEEN {MIN_EVENT_COST} AND {MAX_EVENT_COST}",
            name="energy_cost_range",
        ),
        CheckConstraint("ends_at > starts_at", name="ends_after_starts"),
        Index("ix_events_owner_starts", "owner_id", "starts_at"),
    )
