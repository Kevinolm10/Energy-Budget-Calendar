from datetime import date

from pydantic import BaseModel

class EnergyPeriod(BaseModel):
    start: date
    end: date  # inclusive
    budget: float
    drain: int
    recharge: int
    net: int
    remaining: float
    overbooked: bool


class EnergySummary(BaseModel):
    weekly_budget: int
    day: EnergyPeriod
    week: EnergyPeriod
    month: EnergyPeriod
    week_days: list[EnergyPeriod]