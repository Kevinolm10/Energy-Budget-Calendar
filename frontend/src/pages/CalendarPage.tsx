import { useState } from "react";
import { EventForm } from "@/components/calendar/EventForm";

export function CalendarPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Calendar</h1>
        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          {showForm ? "Close" : "New event"}
        </button>
      </div>

      {showForm && <EventForm />}
    </div>
  );
}