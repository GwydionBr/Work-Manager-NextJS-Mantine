"use client";

import { create } from "zustand";

import { Tables, TablesInsert, TablesUpdate } from "@/types/db.types";
import * as actions from "@/actions";

interface TaskState {
  tasks: Tables<"task">[];
  isFetching: boolean;
  lastFetch: Date | null;
  initialized: boolean | null;
  abortController: AbortController | null;
}

interface TaskActions {
  resetStore: () => void;
  fetchTasksData: () => Promise<void>;
  fetchIfStale: (intervalMs?: number) => Promise<void>;
  abortFetch: () => void;
  createTask: (task: TablesInsert<"task">) => Promise<void>;
  updateTask: (task: TablesUpdate<"task">) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState & TaskActions>()((set, get) => ({
  tasks: [],
  isFetching: false,
  lastFetch: null,
  initialized: null,
  abortController: null,

  resetStore: () =>
    set({
      tasks: [],
      isFetching: false,
      lastFetch: null,
      initialized: null,
      abortController: null,
    }),
  async fetchIfStale(intervalMs = 5 * 60 * 1000) {
    const { lastFetch, isFetching, abortController } = get();
    const now = Date.now();
    const last = lastFetch ? new Date(lastFetch).getTime() : 0;
    const stale = !lastFetch || now - last > intervalMs;
    if (!stale || isFetching) return;

    // Abort any existing fetch
    if (abortController) {
      abortController.abort();
    }

    await get().fetchTasksData();
  },
  async fetchTasksData() {
    // Create new AbortController for this fetch
    const abortController = new AbortController();
    set({ isFetching: true, abortController });

    try {
      const tasks = await actions.getAllTasks();

      // Check if fetch was aborted
      if (abortController.signal.aborted) {
        return;
      }

      if (tasks.success) {
        set({ tasks: tasks.data, initialized: true, abortController: null });
      } else {
        set({ initialized: false, abortController: null });
      }
      set({ isFetching: false, lastFetch: new Date(), abortController: null });
    } catch (error) {
      // If fetch was aborted, don't update state
      if (abortController.signal.aborted) {
        return;
      }

      // For other errors, reset fetching state
      set({ isFetching: false, initialized: false, abortController: null });
    }
  },

  abortFetch() {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
      set({ isFetching: false, abortController: null });
    }
  },

  async createTask(task) {
    const response = await actions.createTask(task);
    if (response.success) {
      set({ tasks: [...get().tasks, response.data] });
    }
  },
  async updateTask(task) {
    const response = await actions.updateTask(task);
    if (response.success) {
      set({
        tasks: get().tasks.map((t) => (t.id === task.id ? response.data : t)),
      });
    }
  },
  async deleteTask(id) {
    const response = await actions.deleteTask(id);
    if (response.success) {
      set({ tasks: get().tasks.filter((t) => t.id !== id) });
    }
  },
  async toggleTask(id) {
    const { tasks } = get();
    const updatedTask = tasks.find((t) => t.id === id);
    if (!updatedTask) return;

    const updatedTaskData = tasks.map((t) =>
      t.id === id ? { ...t, executed: !t.executed } : t
    );

    set({ tasks: updatedTaskData });

    await actions.updateTask({
      id,
      executed: !updatedTask.executed,
    });
  },
}));

export default useTaskStore;
