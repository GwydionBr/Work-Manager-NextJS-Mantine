"use client";

import * as actions from "@/actions";
import { redirect } from "next/navigation";
import { create } from "zustand";
import { notifications } from "@mantine/notifications";

// Import store instances to reset them
import { useTimeTrackerManager } from "@/stores/timeTrackerManagerStore";
import { useWorkStore } from "@/stores/workManagerStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useFinanceStore } from "@/stores/financeStore";
import { useGroupStore } from "@/stores/groupStore";
import { useTaskStore } from "@/stores/taskStore";
import { useCalendarStore } from "@/stores/calendarStore";

// Function to reset all stores to their initial state
function resetAllStores() {
  // Reset time tracker manager store
  useTimeTrackerManager.getState().resetStore();

  // Reset work manager store
  useWorkStore.getState().resetStore();

  // Reset settings store
  useSettingsStore.getState().resetStore();

  // Reset finance store
  useFinanceStore.getState().resetStore();

  // Reset group store
  useGroupStore.getState().resetStore();

  // Reset task store
  useTaskStore.getState().resetStore();

  // Reset user store (this one)
  useUserStore.getState().resetStore();

  // Reset calendar store
  useCalendarStore.getState().resetStore();
}

interface UserState {}

interface UserActions {
  resetStore: () => void;
  logout: () => Promise<boolean>;
  deleteUser: () => Promise<boolean>;
}

export const useUserStore = create<UserState & UserActions>()((set, get) => ({
  resetStore: () => set({}),

  logout: async () => {
    const response = await actions.logout();

    if (response.success) {
      resetAllStores();
      redirect("/");
    }
    return false;
  },

  deleteUser: async () => {
    const response = await actions.deleteUser();
    if (response.success) {
      resetAllStores();
      notifications.show({
        title: "User deleted",
        message: "Your account has been deleted",
        color: "green",
      });
      redirect("/");
    } else {
      notifications.show({
        title: "Error",
        message: response.error,
        color: "red",
      });
    }
    return false;
  },
}));

export default useUserStore;
