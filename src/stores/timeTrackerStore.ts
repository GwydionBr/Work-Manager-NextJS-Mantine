"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TablesInsert } from "@/types/db.types";
import { secondsToTimerFormat } from "@/utils/workHelperFunctions";
import { Currency } from "@/types/settings.types";

export enum TimerState {
  Stopped = "stopped",
  Running = "running",
  Paused = "paused",
}

interface TimeTrackerState {
  moneyEarned: string;
  activeTime: string;
  pausedTime: string;
  state: TimerState;
  projectTitle: string;
  currency: Currency;
  salary: number;
  projectId: string;
  userId: string;
  startTime: number | null;
  tempStartTime: number | null;
  activeSeconds: number;
  pausedSeconds: number;
  storedActiveSeconds: number;
  storedPausedSeconds: number;

  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  cancelTimer: () => void;
  getCurrentSession: () => TablesInsert<"timerSession">;
  resetTimer: () => void;
  configureProject: (
    projectId: string,
    projectTitle: string,
    currency: Currency,
    salary: number,
    userId: string
  ) => void;
}

let animationFrameId: number | null = null;
let intervalId: NodeJS.Timeout | null = null;

export const useTimeTracker = create(
  persist<TimeTrackerState>(
    (set, get) => ({
      moneyEarned: "0.00",
      activeTime: "00:00",
      pausedTime: "00:00",
      state: TimerState.Stopped,
      projectTitle: "",
      currency: "USD",
      salary: 0,
      projectId: "",
      userId: "",
      startTime: null,
      tempStartTime: null,
      activeSeconds: 0,
      pausedSeconds: 0,
      storedActiveSeconds: 0,
      storedPausedSeconds: 0,

      configureProject: (projectId, projectTitle, currency, salary, userId) => {
        if (get().state !== TimerState.Stopped) {
          return;
        }

        set({
          projectId,
          projectTitle,
          currency,
          salary,
          userId,
          moneyEarned: "0.00",
          activeTime: "00:00",
          pausedTime: "00:00",
          state: TimerState.Stopped,
        });
      },

      startTimer: () => {
        if (get().state !== TimerState.Stopped || get().projectTitle === "") {
          return;
        }

        set({
          state: TimerState.Running,
          startTime: Date.now(),
          tempStartTime: Date.now(),
        });

        // Running-Timer-Loop
        const updateLoop = () => {
          if (get().state !== TimerState.Running) {
            return;
          }

          const newActiveSeconds =
            Math.floor((Date.now() - (get().tempStartTime ?? 0)) / 1000) +
            get().storedActiveSeconds;
          const newActiveTime = secondsToTimerFormat(newActiveSeconds);
          set({
            activeSeconds: newActiveSeconds,
            activeTime: newActiveTime,
            moneyEarned: ((newActiveSeconds / 3600) * get().salary).toFixed(2),
          });
          document.title = `${newActiveTime} - ${get().projectTitle} | Work Manager`;
        };

        // Clear any existing interval
        if (intervalId) {
          clearInterval(intervalId);
        }

        // Start new interval
        intervalId = setInterval(updateLoop, 1000);
        updateLoop(); // Run immediately
      },

      pauseTimer: () => {
        if (get().state !== TimerState.Running) {
          return;
        }

        set({
          state: TimerState.Paused,
          storedActiveSeconds: get().activeSeconds,
          tempStartTime: Date.now(),
        });

        // Paused-Timer-Loop
        const updateLoop = () => {
          if (get().state !== TimerState.Paused) {
            return;
          }

          const newPausedSeconds =
            Math.floor((Date.now() - (get().tempStartTime ?? 0)) / 1000) +
            get().storedPausedSeconds;
          const newPausedTime = secondsToTimerFormat(newPausedSeconds);
          set({
            pausedSeconds: newPausedSeconds,
            pausedTime: newPausedTime,
          });
          document.title = `⏸️ ${get().activeTime} - ${get().projectTitle} | Work Manager`;
        };

        // Clear any existing interval
        if (intervalId) {
          clearInterval(intervalId);
        }

        // Start new interval
        intervalId = setInterval(updateLoop, 1000);
        updateLoop(); // Run immediately
      },

      resumeTimer: () => {
        if (get().state !== TimerState.Paused) {
          return;
        }

        set({
          state: TimerState.Running,
          storedPausedSeconds: get().pausedSeconds,
          tempStartTime: Date.now(),
        });

        // Running-Timer-Loop
        const updateLoop = () => {
          if (get().state !== TimerState.Running) {
            return;
          }

          const newActiveSeconds =
            Math.floor((Date.now() - (get().tempStartTime ?? 0)) / 1000) +
            get().storedActiveSeconds;
          const newActiveTime = secondsToTimerFormat(newActiveSeconds);
          set({
            activeSeconds: newActiveSeconds,
            activeTime: newActiveTime,
            moneyEarned: ((newActiveSeconds / 3600) * get().salary).toFixed(2),
          });
          document.title = `${newActiveTime} - ${get().projectTitle} | Work Manager`;
        };

        // Clear any existing interval
        if (intervalId) {
          clearInterval(intervalId);
        }

        // Start new interval
        intervalId = setInterval(updateLoop, 1000);
        updateLoop(); // Run immediately
      },

      stopTimer: () => {
        if (get().state === TimerState.Stopped) {
          return;
        }
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }

        set({
          state: TimerState.Stopped,
          moneyEarned: "0.00",
          activeTime: "00:00",
          pausedTime: "00:00",
          activeSeconds: 0,
          pausedSeconds: 0,
          startTime: null,
          tempStartTime: null,
          storedActiveSeconds: 0,
          storedPausedSeconds: 0,
        });
        document.title = "Work Manager";
      },

      cancelTimer: () => {
        if (get().state === TimerState.Stopped) {
          return;
        }
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }

        set({
          state: TimerState.Stopped,
          moneyEarned: "0.00",
          activeTime: "00:00",
          pausedTime: "00:00",
          activeSeconds: 0,
          pausedSeconds: 0,
          startTime: null,
          tempStartTime: null,
          storedActiveSeconds: 0,
          storedPausedSeconds: 0,
        });
        document.title = "Work Manager";
      },

      getCurrentSession: () => {
        const newTimerSession: TablesInsert<"timerSession"> = {
          user_id: get().userId,
          project_id: get().projectId,
          start_time: new Date(get().startTime ?? 0).toISOString(),
          end_time: new Date().toISOString(),
          active_seconds: get().activeSeconds,
          paused_seconds: get().pausedSeconds,
          salary: get().salary,
          currency: get().currency,
        };

        return newTimerSession;
      },

      resetTimer: () => {},
    }),

    { name: "time-tracker-storage" }
  )
);
