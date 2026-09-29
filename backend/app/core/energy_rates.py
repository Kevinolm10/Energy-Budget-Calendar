from enum import StrEnum


class EventCategory(StrEnum):
    WORK = "work"
    MEETING = "meeting"
    STUDY = "study"
    SOCIAL = "social"
    CHORES = "chores"
    EXERCISE = "exercise"
    HOBBY = "hobby"
    REST = "rest"
    OTHER = "other"


# Energy per hour: negative drains, positive recharges
RATES_PER_HOUR: dict[EventCategory, float] = {
    EventCategory.WORK: -2,
    EventCategory.MEETING: -3,
    EventCategory.STUDY: -2,
    EventCategory.SOCIAL: -1,
    EventCategory.CHORES: -1,
    EventCategory.EXERCISE: 1,
    EventCategory.HOBBY: 1,
    EventCategory.REST: 2,
    EventCategory.OTHER: 0,
}

MIN_EVENT_COST = -50
MAX_EVENT_COST = 50
DEFAULT_WEEKLY_BUDGET = 100