"use client";

import { create } from "zustand";
import { TimerData } from "@/stores/timeTrackerManagerStore";
import { Tables, TablesInsert, TablesUpdate } from "@/types/db.types";
import * as actions from "@/actions";

interface CalendarStoreState {
  activeTimer: TimerData | null;
  appointments: Tables<"appointment">[];
  eventIsHovered: boolean;
  eventIsSelected: boolean;
  entryMode: boolean;
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
  setActiveTimer: (timer: TimerData | null) => void;
  setEventIsHovered: (isHovered: boolean) => void;
  setEventIsSelected: (isSelected: boolean) => void;
  setEntryMode: (isEntryMode: boolean) => void;
}

export const useCalendarStore = create<
  CalendarStoreState & CalendarStoreActions
>((set, get) => ({
  activeTimer: null,
  appointments: [],
  eventIsHovered: false,
  eventIsSelected: false,
  entryMode: false,
  isFetching: true,
  lastFetch: null,
  resetStore: () =>
    set({
      activeTimer: null,
      appointments: [],
      eventIsHovered: false,
      eventIsSelected: false,
      entryMode: false,
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
  setEventIsHovered: (isHovered: boolean) => set({ eventIsHovered: isHovered }),
  setEventIsSelected: (isSelected: boolean) =>
    set({ eventIsSelected: isSelected }),
  setEntryMode: (isEntryMode: boolean) => set({ entryMode: isEntryMode }),
}));
