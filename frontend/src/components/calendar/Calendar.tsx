import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import type { DatesSetArg } from "@fullcalendar/core";
import { getEvents, type CalendarEvent } from "@/api/events";
import { toCalendarEvent } from "@/lib/calendarEvents";

export function Calendar() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);

    async function handleDatesSet(info: DatesSetArg) {
        const start = info.start.toISOString();
        const end = info.end.toISOString();
        try {
            setEvents(await getEvents(start, end));
        } catch (err) {
            console.error("Failed to load events:", err);
        }
    }

    return (
        <div className="calendar">
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin]}
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
            />
        </div>
    );
}