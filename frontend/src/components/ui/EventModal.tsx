import { useState } from "react";
import Modal from "react-modal";
import { Trash2, Pencil } from "lucide-react";
import { deleteEvent, type CalendarEvent } from "@/api/events";
import { EventForm } from "@/components/calendar/EventForm";

type EventModalProps = {
    event: CalendarEvent | null;
    onClose: () => void;
    onDeleted: (id: number) => void;
    onUpdated: (event: CalendarEvent) => void;
};

const dateTimeFormat: Intl.DateTimeFormatOptions = {
    weekday: "short", day: "numeric", month: "short",
    hour: "2-digit", minute: "2-digit", hour12: false,
};
const timeFormat: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit", hour12: false };

function formatDuration(startsAt: string, endsAt: string): string {
    const minutes = Math.round((new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60000);
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    if (hours === 0) return `${rest} min`;
    return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

function describeRrule(rrule: string): string {
    const freq = rrule.match(/FREQ=(\w+)/)?.[1];
    const days = rrule.match(/BYDAY=([\w,]+)/)?.[1];
    const base = { DAILY: "Daily", WEEKLY: "Weekly", MONTHLY: "Monthly", YEARLY: "Yearly" }[freq ?? ""] ?? "Repeats";
    return days ? `${base} on ${days.replaceAll(",", ", ")}` : base;
}

export function EventModal({ event, onClose, onDeleted, onUpdated }: EventModalProps) {
    const [editing, setEditing] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function startEditing() {
        setError(null);
        setEditing(true);
    }

    async function handleDelete() {
        if (!event) return;
        if (!window.confirm(`Delete "${event.title}"?`)) return;

        setDeleting(true);
        setError(null);
        try {
            await deleteEvent(event.id);
            onDeleted(event.id);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete event");
        } finally {
            setDeleting(false);
        }
    }

    function handleClose() {
        setError(null);
        setEditing(false);
        onClose();
    }

    return (
        <Modal
            isOpen={event !== null}
            onRequestClose={handleClose}
            contentLabel={event?.title ?? "Event details"}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl outline-none"
            overlayClassName="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
            {event && (
                <>
                    {/* title */}
                    <div className="flex items-start justify-between gap-4">
                        <h2 className="text-lg font-semibold text-slate-900">
                            {editing ? "Edit event" : event.title}
                        </h2>
                        <button
                            type="button"
                            onClick={handleClose}
                            aria-label="Close"
                            className="rounded-lg px-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                            ✕
                        </button>
                    </div>

                    {editing ? (
                        <div className="mt-4">
                            <EventForm
                                event={event}
                                onSaved={(updated) => {
                                    onUpdated(updated);
                                    setEditing(false);
                                }}
                                onCancel={() => setEditing(false)}
                            />
                        </div>
                    ) : (
                        <>
                            <dl className="mt-4 space-y-3 text-sm">
                                {/* starts_at + ends_at */}
                                <div className="flex justify-between gap-4">
                                    <dt className="text-slate-500">When</dt>
                                    <dd className="text-right text-slate-900">
                                        {new Date(event.starts_at).toLocaleString(undefined, dateTimeFormat)}
                                        {" – "}
                                        {new Date(event.ends_at).toLocaleString(undefined, timeFormat)}
                                    </dd>
                                </div>

                                {/* duration (calculated) */}
                                <div className="flex justify-between gap-4">
                                    <dt className="text-slate-500">Duration</dt>
                                    <dd className="text-slate-900">{formatDuration(event.starts_at, event.ends_at)}</dd>
                                </div>

                                {/* category */}
                                <div className="flex justify-between gap-4">
                                    <dt className="text-slate-500">Category</dt>
                                    <dd className="capitalize text-slate-900">{event.category}</dd>
                                </div>

                                {/* energy_cost + energy_cost_manual */}
                                <div className="flex justify-between gap-4">
                                    <dt className="text-slate-500">Energy</dt>
                                    <dd>
                                        <span
                                            className={`font-semibold ${event.energy_cost < 0 ? "text-red-600" : event.energy_cost > 0 ? "text-emerald-600" : "text-slate-900"
                                                }`}
                                        >
                                            {event.energy_cost > 0 ? "+" : ""}
                                            {event.energy_cost}
                                        </span>
                                        <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                                            {event.energy_cost_manual ? "manual" : "auto"}
                                        </span>
                                    </dd>
                                </div>

                                {/* rrule (only if set) */}
                                {event.rrule && (
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-slate-500">Repeats</dt>
                                        <dd className="text-slate-900">{describeRrule(event.rrule)}</dd>
                                    </div>
                                )}

                                {/* actions */}
                                <div className="flex items-center justify-between gap-4">
                                    <dt className="text-slate-500">Actions</dt>
                                    <dd className="flex gap-1">
                                        <button
                                            type="button"
                                            onClick={startEditing}
                                            aria-label="Edit event"
                                            title="Edit event"
                                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                        >
                                            <Pencil size={16} aria-hidden="true" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            disabled={deleting}
                                            aria-label="Delete event"
                                            title="Delete event"
                                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                        >
                                            <Trash2 size={16} aria-hidden="true" />
                                        </button>
                                    </dd>
                                </div>
                            </dl>

                            {error && (
                                <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                                    {error}
                                </p>
                            )}

                            {/* notes (only if set) */}
                            {event.notes && (
                                <div className="mt-4">
                                    <p className="text-sm text-slate-500">Notes</p>
                                    <p className="mt-1 rounded-lg bg-slate-50 p-3 text-sm whitespace-pre-wrap text-slate-700">
                                        {event.notes}
                                    </p>
                                </div>
                            )}

                            {/* id + created_at + updated_at */}
                            <p className="mt-6 border-t border-slate-100 pt-3 text-xs text-slate-400">
                                Event #{event.id} · Created {new Date(event.created_at).toLocaleString(undefined, dateTimeFormat)}
                                {event.updated_at !== event.created_at &&
                                    ` · Updated ${new Date(event.updated_at).toLocaleString(undefined, dateTimeFormat)}`}
                            </p>
                        </>
                    )}
                </>
            )}
        </Modal>
    );
}