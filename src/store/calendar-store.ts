import { create } from "zustand";

import { CALENDAR_EVENTS, type CalendarEvent } from "@/data/calendar-events";

let nextUserId = 0;

type CalendarStore = {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, "id">) => void;
  updateEvent: (id: string, updates: Omit<CalendarEvent, "id">) => void;
  deleteEvent: (id: string) => void;
  resetEvents: () => void;
};

// Single source of truth for calendar events: the seed data starts the
// store, and anything added/edited/deleted through EventFormSheet lands in
// the same array — every screen reading from this store sees it immediately,
// no prop drilling.
export const useCalendarStore = create<CalendarStore>((set) => ({
  events: CALENDAR_EVENTS,
  addEvent: (event) =>
    set((state) => ({
      events: [...state.events, { ...event, id: `evt-user-${nextUserId++}` }],
    })),
  updateEvent: (id, updates) =>
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? { ...updates, id } : e)),
    })),
  deleteEvent: (id) =>
    set((state) => ({
      events: state.events.filter((e) => e.id !== id),
    })),
  resetEvents: () => set({ events: CALENDAR_EVENTS }),
}));
