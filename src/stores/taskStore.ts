"use client";

import { create } from "zustand";

import { Tables, TablesInsert, TablesUpdate } from "@/types/db.types";
import * as actions from "@/actions";

interface TaskState {
  tasks: Tables<"task">[];
  isFetching: boolean;
  lastFetch: Date | null;
}

interface TaskActions {
  resetStore: () => void;
  fetchTasksData: () => Promise<void>;
  createTask: (task: TablesInsert<"task">) => Promise<void>;
  updateTask: (task: TablesUpdate<"task">) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState & TaskActions>()((set, get) => ({
  tasks: [],
  isFetching: true,
  lastFetch: null,

  resetStore: () =>
    set({
      tasks: [],
      isFetching: true,
      lastFetch: null,
    }),
  async fetchTasksData() {
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
  async createTask(task) {
    const response = await actions.createTask(task);
    console.log(response);
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
