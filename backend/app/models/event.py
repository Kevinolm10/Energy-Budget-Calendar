from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, datetime, ForeignKey, Index, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base

if TYPE_CHECKING:
    from app.models.user import User


class Event(Base):
    __table__ = "events"

    id: Mapped[int] = mapped_column(primary_key=True)
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", 
        ondelete="CASCADE")
        )
    title: Mapped[str] = mapped_column(String(200))
    notes: Mapped[str | None] = mapped_column(Text)
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    energy_cost: Mapped[int] = mapped_column(default=0)
    rrule: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now()
        )

    owner: Mapped["User"] = relationship(back_populates="events")

    __table_args__ = (
        CheckConstraint("energy_cost BETWEEN -5 AND 5", name="energy_cost_range"),
        CheckConstraint("ends_at > starts_at", name="ends_after_starts"),
        Index("ix_events_owner_starts", "owner_id", "starts_at"),
    )