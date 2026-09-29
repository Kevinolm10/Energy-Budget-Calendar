from datetime import datetime

from app.core.energy_rates import MAX_EVENT_COST, MIN_EVENT_COST, RATES_PER_HOUR, EventCategory


def estimate_energy_cost(category: EventCategory | str, starts_at: datetime, ends_at: datetime) -> int:
    hours = (ends_at - starts_at).total_seconds() / 3600
    cost = round(RATES_PER_HOUR[EventCategory(category)] * hours)
    return max(MIN_EVENT_COST, min(MAX_EVENT_COST, cost))