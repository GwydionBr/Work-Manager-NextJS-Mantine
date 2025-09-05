"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { TimerData } from "@/stores/timeTrackerManagerStore";
import { Tables, TablesInsert, TablesUpdate } from "@/types/db.types";
import * as actions from "@/actions";
import { ViewMode } from "@/types/workCalendar.types";
import { startOfWeek, endOfWeek } from "date-fns";

interface CalendarStoreState {
  activeTimer: TimerData | null;
  appointments: Tables<"appointment">[];
  selectedSession: Tables<"timer_session"> | null;
  dateRange: [Date | null, Date | null];
  currentDateRange: [Date, Date];
  referenceDate: Date;
  newEventStartY: number | null;
  newEventEndY: number | null;
  newEventDay: Date | null;
  viewMode: ViewMode;
  zoomIndex: number;
  rasterHeight: number;
  eventIsHovered: boolean;
  eventIsSelected: boolean;
  addingMode: boolean;
  isFetching: boolean;
  lastFetch: Date | null;
}

interface CalendarStoreActions {
  resetStore: () => void;
  fetchCalendarData: () => Promise<void>;
  createAppointment: (
    appointment: TablesInsert<"appointment">
  ) => Promise<boolean>;
  updateAppointment: (
    appointment: TablesUpdate<"appointment">
  ) => Promise<boolean>;
  deleteAppointment: (id: string) => Promise<boolean>;
  setViewMode: (viewMode: ViewMode) => void;
  changeZoomIndex: (delta: number) => void;
  setSelectedSession: (selectedSession: Tables<"timer_session"> | null) => void;
  setDateRange: (dateRange: [Date | null, Date | null]) => void;
  setCurrentDateRange: (currentDateRange: [Date, Date]) => void;
  setReferenceDate: (referenceDate: Date) => void;
  setNewEventStartY: (newEventStartY: number | null) => void;
  setNewEventEndY: (newEventEndY: number | null) => void;
  setNewEventDay: (newEventDay: Date | null) => void;
  setActiveTimer: (timer: TimerData | null) => void;
  setEventIsHovered: (isHovered: boolean) => void;
  setEventIsSelected: (isSelected: boolean) => void;
  setAddingMode: (isAddingMode: boolean) => void;
}

export const useCalendarStore = create<
  CalendarStoreState & CalendarStoreActions
>()(
  persist(
    (set, get) => ({
      activeTimer: null,
      appointments: [],
      viewMode: "week",
      zoomIndex: 1,
      rasterHeight: 60,
      eventIsHovered: false,
      eventIsSelected: false,
      addingMode: false,
      selectedSession: null,
      dateRange: [
        startOfWeek(new Date(), { weekStartsOn: 1 }),
        endOfWeek(new Date(), { weekStartsOn: 1 }),
      ],
      currentDateRange: [
        startOfWeek(new Date(), { weekStartsOn: 1 }),
        endOfWeek(new Date(), { weekStartsOn: 1 }),
      ],
      referenceDate: new Date(),
      newEventStartY: null,
      newEventEndY: null,
      newEventDay: null,
      isFetching: true,
      lastFetch: null,
      resetStore: () =>
        set({
          activeTimer: null,
          appointments: [],
          viewMode: "week",
          zoomIndex: 1,
          rasterHeight: 60,
          eventIsHovered: false,
          eventIsSelected: false,
          addingMode: false,
          selectedSession: null,
          dateRange: [
            startOfWeek(new Date(), { weekStartsOn: 1 }),
            endOfWeek(new Date(), { weekStartsOn: 1 }),
          ],
          currentDateRange: [
            startOfWeek(new Date(), { weekStartsOn: 1 }),
            endOfWeek(new Date(), { weekStartsOn: 1 }),
          ],
          referenceDate: new Date(),
          newEventStartY: null,
          newEventEndY: null,
          newEventDay: null,
          isFetching: true,
          lastFetch: null,
        }),
      fetchCalendarData: async () => {
        set({ isFetching: true });
        const appointments = await actions.getAllAppointments();
        if (appointments.success) {
          set({ appointments: appointments.data });
          set({ isFetching: false, lastFetch: new Date() });
        } else {
          set({ isFetching: false });
        }
      },
      createAppointment: async (appointment) => {
        const { appointments } = get();
        const response = await actions.createAppointment(appointment);
        console.log("response", response);
        if (response.success) {
          const newAppointments = [...appointments, response.data];
          set({ appointments: newAppointments });
          return true;
        }
        return false;
      },
      updateAppointment: async (appointment) => {
        const { appointments } = get();
        const response = await actions.updateAppointment(appointment);
        if (response.success) {
          const newAppointments = appointments.map((a) =>
            a.id === appointment.id ? response.data : a
          );
          set({ appointments: newAppointments });
          return true;
        }
        return false;
      },
      deleteAppointment: async (id) => {
        const { appointments } = get();
        const response = await actions.deleteAppointment(id);
        if (response.success) {
          const newAppointments = appointments.filter((a) => a.id !== id);
          set({ appointments: newAppointments });
          return true;
        }
        return false;
      },
      setActiveTimer: (timer: TimerData | null) => set({ activeTimer: timer }),
      setEventIsHovered: (isHovered: boolean) =>
        set({ eventIsHovered: isHovered }),
      setEventIsSelected: (isSelected: boolean) =>
        set({ eventIsSelected: isSelected }),
      setAddingMode: (isAddingMode: boolean) =>
        set({ addingMode: isAddingMode }),
      setSelectedSession: (selectedSession: Tables<"timer_session"> | null) =>
        set({ selectedSession }),
      setDateRange: (dateRange: [Date | null, Date | null]) =>
        set({ dateRange }),
      setCurrentDateRange: (currentDateRange: [Date, Date]) =>
        set({ currentDateRange }),
      setReferenceDate: (referenceDate: Date) => set({ referenceDate }),
      setNewEventStartY: (newEventStartY: number | null) =>
        set({ newEventStartY: newEventStartY }),
      setNewEventEndY: (newEventEndY: number | null) =>
        set({ newEventEndY: newEventEndY }),
      setNewEventDay: (newEventDay: Date | null) =>
        set({ newEventDay: newEventDay }),
      setViewMode: (viewMode: ViewMode) => set({ viewMode }),
      changeZoomIndex: (delta: number) =>
        set((state) => ({
          zoomIndex: Math.max(0, Math.min(state.zoomIndex + delta, 4)),
        })),
    }),
    {
      name: "calendar-store",
      partialize: (state) => ({
        zoomIndex: state.zoomIndex,
      }),
    }
  )
);
