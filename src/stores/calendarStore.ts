"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CalendarState {}

interface CalendarActions {}

export const useCalendar = create(
  persist<CalendarState & CalendarActions>(
    (set, get) => ({}),

    {
      name: "calendar-storage",
    }
  )
);
