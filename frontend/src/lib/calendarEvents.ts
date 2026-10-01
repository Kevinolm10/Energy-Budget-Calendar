import type { EventInput } from "@fullcalendar/core";
import type { CalendarEvent } from "@/api/events";

function energyColor(cost: number): string {
    if (cost < 0) return "#dc2626"; // drain
    if (cost > 0) return "#059669"; // recharge
    return "#64748b";               // neutral
}

export function toCalendarEvent(event: CalendarEvent): EventInput {
    const sign = event.energy_cost > 0 ? "+" : "";
    return {
        id: String(event.id),
        title: `${event.title} (${sign}${event.energy_cost})`,
        start: event.starts_at,
        end: event.ends_at,
        backgroundColor: energyColor(event.energy_cost),
        borderColor: "transparent",
        extendedProps: { event },
    };
}