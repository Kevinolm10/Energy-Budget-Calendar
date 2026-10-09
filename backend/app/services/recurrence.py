from datetime import datetime

from dateutil.rrule import rrulestr

from app.models import Event

def expand_occurrences(event: Event, range_start: datetime, range_end: datetime) -> list[datetime]:
    """Start times of an event's occurrences within [range_start, range_end)."""
    if not event.rrule:
        if range_start <= event.starts_at < range_end:
            return [event.starts_at]
        return []

    try:
        rule = rrulestr(event.rrule, dtstart=event.starts_at)
    except (ValueError, TypeError):
        return []

    return [occ for occ in rule.between(range_start, range_end, inc=True) if occ < range_end]