"use client";

import { create } from "zustand";
import { TimerData } from "@/stores/timeTrackerManagerStore";

interface CalendarStoreState {
  activeTimer: TimerData | null;
  eventIsHovered: boolean;
  eventIsSelected: boolean;
  entryMode: boolean;
}

interface CalendarStoreActions {
  resetStore: () => void;
  setActiveTimer: (timer: TimerData | null) => void;
  setEventIsHovered: (isHovered: boolean) => void;
  setEventIsSelected: (isSelected: boolean) => void;
  setEntryMode: (isEntryMode: boolean) => void;
}

export const useCalendarStore = create<
  CalendarStoreState & CalendarStoreActions
>((set) => ({
  activeTimer: null,
  eventIsHovered: false,
  eventIsSelected: false,
  entryMode: false,
  resetStore: () =>
    set({
      activeTimer: null,
      eventIsHovered: false,
      eventIsSelected: false,
      entryMode: false,
    }),
  setActiveTimer: (timer: TimerData | null) => set({ activeTimer: timer }),
  setEventIsHovered: (isHovered: boolean) => set({ eventIsHovered: isHovered }),
  setEventIsSelected: (isSelected: boolean) =>
    set({ eventIsSelected: isSelected }),
  setEntryMode: (isEntryMode: boolean) => set({ entryMode: isEntryMode }),
}));
