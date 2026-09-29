import { useState, type FormEvent } from "react";
import { createEvent } from "@/api/event";


export function EventForm() {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [energyCost, setEnergyCost] = useState(0);
  const [rrule, setRrule] = useState("");
  const [onSaved, setOnSaved] = useState<(() => void) | null>(null);
  const [error, setError] = useState<string | null>(null);

async function handleSubmit(event: FormEvent) {
  event.preventDefault();
  setError(null);
  try {
    await createEvent({
      title,
      notes: notes || null,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(endsAt).toISOString(),
      energy_cost: energyCost,
      rrule: rrule || null,
    });
    setTitle("");
    setNotes("");
    setStartsAt("");
    setEndsAt("");
    setEnergyCost(0);
    setRrule("");
    onSaved?.();
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to create event");
  }
}

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="startsAt" className="block text-sm font-medium text-gray-700">
          Starts At
        </label>
        <input
          id="startsAt"
          type="datetime-local"
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="endsAt" className="block text-sm font-medium text-gray-700">
          Ends At
        </label>
        <input
          id="endsAt"
          type="datetime-local"
          value={endsAt}
          onChange={(e) => setEndsAt(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="energyCost" className="block text-sm font-medium text-gray-700">
          Energy Cost
        </label>
        <input
          id="energyCost"
          type="number"
          value={energyCost}
          onChange={(e) => setEnergyCost(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="rrule" className="block text-sm font-medium text-gray-700">
          Recurrence Rule (RRULE)
        </label>
        <input
          id="rrule"
          type="text"
          value={rrule}
          onChange={(e) => setRrule(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Create Event
      </button>
    </form>
  );
}