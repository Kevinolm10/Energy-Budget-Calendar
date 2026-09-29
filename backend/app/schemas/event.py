from datetime import datetime
from typing import Self

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, model_validator


class EventBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    notes: str | None = None
    starts_at: AwareDatetime
    ends_at: AwareDatetime
    energy_cost: int = Field(default=0, ge=-5, le=5)
    rrule: str | None = Field(default=None, max_length=500)

    @model_validator(mode="after")
    def check_times(self) -> Self:
        if self.ends_at <= self.starts_at:
            raise ValueError("ends_at must be after starts_at")
        return self


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    notes: str | None = None
    starts_at: AwareDatetime | None = None
    ends_at: AwareDatetime | None = None
    energy_cost: int | None = Field(default=None, ge=-5, le=5)
    rrule: str | None = Field(default=None, max_length=500)

    @model_validator(mode="after")
    def check_fields(self) -> Self:
        # These columns are required, so they may be omitted but never set to null
        for field in ("title", "starts_at", "ends_at", "energy_cost"):
            if field in self.model_fields_set and getattr(self, field) is None:
                raise ValueError(f"{field} cannot be null")

        if self.starts_at and self.ends_at and self.ends_at <= self.starts_at:
            raise ValueError("ends_at must be after starts_at")
        return self


class EventRead(EventBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime