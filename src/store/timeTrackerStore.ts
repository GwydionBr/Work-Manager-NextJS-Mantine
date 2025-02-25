'use client';

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { formatTime } from "@/utils/workHelperFunctions";


enum TimerState {
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
  currency: string;
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
  resetTimer: () => void;
  configureProject: (projectId: string, projectTitle: string, currency: string, salary: number) => void;
}

let animationFrameId: number | null = null;

export const useTimeTracker = create(
  persist<TimeTrackerState>(
    (set, get) => ({
      moneyEarned: "0.00",
      activeTime: "00:00",
      pausedTime: "00:00",
      state: TimerState.Stopped,
      projectTitle: "",
      currency: "$",
      salary: 0,
      projectId: "",
      userId: "",
      startTime: null,
      tempStartTime: null,
      activeSeconds: 0,
      pausedSeconds: 0,
      storedActiveSeconds: 0,
      storedPausedSeconds: 0,

      configureProject: (projectId, projectTitle, currency, salary) => {

        if (get().state !== TimerState.Stopped) {return}

        set({
          projectId,
          projectTitle,
          currency,
          salary,
          moneyEarned: "0.00",
          activeTime: "00:00",
          pausedTime: "00:00",
          state: TimerState.Stopped,
        });
      },


      startTimer: () => {
        if (get().state !== TimerState.Stopped || get().projectTitle === "") {return};

        set({
          state: TimerState.Running,
          startTime: Date.now(),
          tempStartTime: Date.now(),
        });

        // Running-Timer-Loop
        const updateLoop = () => {
          if (get().state !== TimerState.Running) {return};

          const newActiveSeconds = Math.floor((Date.now() - (get().tempStartTime ?? 0)) / 1000) + get().storedActiveSeconds;
          set({
            activeSeconds: newActiveSeconds,
            activeTime: formatTime(newActiveSeconds),
            moneyEarned: ((newActiveSeconds / 3600) * get().salary).toFixed(2),
          });
          animationFrameId = requestAnimationFrame(updateLoop);
        };
        updateLoop();
      },

      pauseTimer: () => {
        if (get().state !== TimerState.Running) {return};

        set({
          state: TimerState.Paused,
          storedActiveSeconds: get().activeSeconds,
          tempStartTime: Date.now(),

        });

        // Paused-Timer-Loop
        const updateLoop = () => {
          if (get().state !== TimerState.Paused) {return};

          const newPausedSeconds = Math.floor((Date.now() - (get().tempStartTime ?? 0)) / 1000) + get().storedPausedSeconds;
          set({
            pausedSeconds: newPausedSeconds,
            pausedTime: formatTime(newPausedSeconds),
          });
          animationFrameId = requestAnimationFrame(updateLoop);
        };
        updateLoop();

      },


      resumeTimer: () => {
        if (get().state !== TimerState.Paused) {return};

        set({
          state: TimerState.Running,
          storedPausedSeconds: get().pausedSeconds,
          tempStartTime: Date.now(),
        });

        // Running-Timer-Loop
        const updateLoop = () => {
          if (get().state !== TimerState.Running) {return};

          const newActiveSeconds = Math.floor((Date.now() - (get().tempStartTime ?? 0)) / 1000) + get().storedActiveSeconds;
          set({
            activeSeconds: newActiveSeconds,
            activeTime: formatTime(newActiveSeconds),
            moneyEarned: ((newActiveSeconds / 3600) * get().salary).toFixed(2),
          });
          animationFrameId = requestAnimationFrame(updateLoop);
        };
        updateLoop();
      },


      stopTimer: () => {
        if (get().state === TimerState.Stopped) {return};
        if (animationFrameId) {cancelAnimationFrame(animationFrameId)};

        set({
          state: TimerState.Stopped,
          moneyEarned: '0.00',
          activeTime: '00:00',
          pausedTime: '00:00',
          activeSeconds: 0,
          pausedSeconds: 0,
          startTime: null,
          tempStartTime: null,
          storedActiveSeconds: 0,
          storedPausedSeconds: 0,
        });
      },

      resetTimer: () => {
        
      },
    }),

    { name: "time-tracker-storage" }
  )
);