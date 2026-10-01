import { useEffect, useState, type FormEvent } from "react";
import {
  createEvent,
  getCategories,
  type CategoryRate,
  type EventCategory,
  type EventCreate,
} from "@/api/events";

const MIN_COST = -50;
const MAX_COST = 50;

const inputClass =
  "mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none " +
  "focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10";
const labelClass = "block text-sm font-medium text-slate-700";

type EventFormProps = {
  onSaved?: () => void;
};

export function EventForm({ onSaved }: EventFormProps) {
  const [categories, setCategories] = useState<CategoryRate[]>([]);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState<EventCategory>("other");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [manualEnergy, setManualEnergy] = useState(false);
  const [energyCost, setEnergyCost] = useState(0);
  const [rrule, setRrule] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setError("Could not load categories"));
  }, []);

  // Live preview of the automatic energy cost (the backend value is authoritative)
  const estimate = (() => {
    if (!startsAt || !endsAt) return null;
    const hours = (new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 3_600_000;
    if (hours <= 0) return null;
    const rate = categories.find((c) => c.category === category)?.rate_per_hour ?? 0;
    return Math.max(MIN_COST, Math.min(MAX_COST, Math.round(rate * hours)));
  })();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const data: EventCreate = {
      title,
      notes: notes || null,
      category,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(endsAt).toISOString(),
      rrule: rrule || null,
      ...(manualEnergy ? { energy_cost: energyCost } : {}),
    };

    try {
      await createEvent(data);
      setTitle("");
      setNotes("");
      setCategory("other");
      setStartsAt("");
      setEndsAt("");
      setManualEnergy(false);
      setEnergyCost(0);
      setRrule("");
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <div>
        <label htmlFor="title" className={labelClass}>Title</label>
        <input
          id="title"
          type="text"
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="category" className={labelClass}>Category</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as EventCategory)}
          className={`${inputClass} bg-white capitalize`}
        >
          {categories.map((c) => (
            <option key={c.category} value={c.category}>
              {c.category} ({c.rate_per_hour > 0 ? "+" : ""}{c.rate_per_hour}/hour)
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="startsAt" className={labelClass}>Starts</label>
          <input
            id="startsAt"
            type="datetime-local"
            required
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="endsAt" className={labelClass}>Ends</label>
          <input
            id="endsAt"
            type="datetime-local"
            required
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="rounded-lg bg-slate-50 p-3">
        {manualEnergy ? (
          <div>
            <label htmlFor="energyCost" className={labelClass}>Energy (manual)</label>
            <input
              id="energyCost"
              type="number"
              min={MIN_COST}
              max={MAX_COST}
              step={1}
              value={energyCost}
              onChange={(e) => setEnergyCost(Number(e.target.value))}
              className={inputClass}
            />
          </div>
        ) : (
          <p className="text-sm text-slate-600">
            Estimated energy:{" "}
            {estimate === null ? (
              <span className="text-slate-400">pick a start and end time</span>
            ) : (
              <span className={`font-semibold ${estimate < 0 ? "text-red-600" : "text-emerald-600"}`}>
                {estimate > 0 ? "+" : ""}
                {estimate}
              </span>
            )}
          </p>
        )}

        <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={manualEnergy}
            onChange={(e) => {
              setManualEnergy(e.target.checked);
              if (e.target.checked && estimate !== null) setEnergyCost(estimate);
            }}
            className="h-4 w-4 accent-slate-900"
          />
          Set energy manually
        </label>
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>Notes</label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="rrule" className={labelClass}>Repeat (RRULE, optional)</label>
        <input
          id="rrule"
          type="text"
          placeholder="e.g. FREQ=WEEKLY;BYDAY=MO"
          value={rrule}
          onChange={(e) => setRrule(e.target.value)}
          className={inputClass}
        />
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {submitting ? "Saving..." : "Create event"}
      </button>
    </form>
  );
}