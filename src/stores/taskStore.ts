"use client";

import { create } from "zustand";

import { Tables } from "@/types/db.types";
import * as actions from "@/actions";

interface TaskState {
  tasks: Tables<"task">[];
  isFetching: boolean;
  lastFetch: Date | null;
}

interface TaskActions {
  fetchTasks: () => Promise<void>;
}

export const useTaskStore = create<TaskState & TaskActions>()(
  (set, get) => ({
    tasks: [],
    isFetching: true,
    lastFetch: null,

    async fetchTasks() {
      set({ isFetching: true });
      const tasks = await actions.getAllTasks();
      if (tasks.success) {
        set({ tasks: tasks.data });
      } else {
        console.error(tasks.error);
      }
      set({ isFetching: false });
      set({ lastFetch: new Date() });
    },
  })
);

export default useTaskStore;
