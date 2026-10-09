import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DatesSetArg, EventClickArg, EventHoveringArg } from "@fullcalendar/core";
import { getEvents, type CalendarEvent } from "@/api/events";
import { toCalendarEvent } from "@/lib/calendarEvents";
import { EventModal } from "@/components/ui/EventModal";

type HoveredEvent = {
    event: CalendarEvent;
    top: number;
    left: number;
};

const hoverTimeFormat: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit", hour12: false };

export function Calendar() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [hovered, setHovered] = useState<HoveredEvent | null>(null);

    async function handleDatesSet(info: DatesSetArg) {
        const start = info.start.toISOString();
        const end = info.end.toISOString();
        try {
            setEvents(await getEvents(start, end));
        } catch (err) {
            console.error("Failed to load events:", err);
        }
    }

    function handleEventClick(info: EventClickArg) {
        setHovered(null);
        setSelectedEvent(info.event.extendedProps.event as CalendarEvent);
    }

    function handleMouseEnter(info: EventHoveringArg) {
        const rect = info.el.getBoundingClientRect();
        setHovered({
            event: info.event.extendedProps.event as CalendarEvent,
            top: rect.bottom + 6,
            left: rect.left,
        });
    }

    function handleMouseLeave() {
        setHovered(null);
    }

    return (
        <div className="calendar">
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                firstDay={1}
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                buttonText={{ today: "Today", month: "Month", week: "Week", day: "Day" }}
                nowIndicator
                height="auto"
                eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
                slotLabelFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
                datesSet={handleDatesSet}
                events={events.map(toCalendarEvent)}
                eventClick={handleEventClick}
                eventMouseEnter={handleMouseEnter}
                eventMouseLeave={handleMouseLeave}
                selectable
                eventDisplay="block"
            />

            {hovered && (
                <div
                    className="pointer-events-none fixed z-40 w-56 rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-lg"
                    style={{ top: hovered.top, left: hovered.left }}
                >
                    <p className="font-semibold text-slate-900">{hovered.event.title}</p>
                    <p className="mt-1 text-slate-500">
                        {new Date(hovered.event.starts_at).toLocaleTimeString(undefined, hoverTimeFormat)}
                        {" – "}
                        {new Date(hovered.event.ends_at).toLocaleTimeString(undefined, hoverTimeFormat)}
                        <span className="capitalize"> · {hovered.event.category}</span>
                    </p>
                    <p
                        className={`mt-1 font-semibold ${hovered.event.energy_cost < 0
                            ? "text-red-600"
                            : hovered.event.energy_cost > 0
                                ? "text-emerald-600"
                                : "text-slate-700"
                            }`}
                    >
                        {hovered.event.energy_cost > 0 ? "+" : ""}
                        {hovered.event.energy_cost} energy
                    </p>
                </div>
            )}

            <EventModal
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
                onDeleted={(id) => setEvents((prev) => prev.filter((e) => e.id !== id))}
                onUpdated={(updated) => {
                    setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
                    setSelectedEvent(updated);
                }}
            />
        </div>
    );
}