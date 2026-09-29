import { apiRequest } from "./client";

export interface CalendarEvent {
  id: number;
  title: string;
  notes: string | null;
  starts_at: string;
  ends_at: string;
  energy_cost: number;
  rrule: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventCreate {
  title: string;
  notes?: string | null;
  starts_at: string;
  ends_at: string;
  energy_cost?: number;
  rrule?: string | null;
}

export type EventUpdate = Partial<EventCreate>;

export function getEvents(start: string, end: string): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({ start, end });
  return apiRequest<CalendarEvent[]>(`/api/events?${params}`);
}

export function getEvent(id: number): Promise<CalendarEvent> {
  return apiRequest<CalendarEvent>(`/api/events/${id}`);
}

export function createEvent(data: EventCreate): Promise<CalendarEvent> {
  return apiRequest<CalendarEvent>("/api/events", { method: "POST", body: data });
}

export function updateEvent(id: number, data: EventUpdate): Promise<CalendarEvent> {
  return apiRequest<CalendarEvent>(`/api/events/${id}`, { method: "PATCH", body: data });
}

export function deleteEvent(id: number): Promise<void> {
  return apiRequest<void>(`/api/events/${id}`, { method: "DELETE" });
}