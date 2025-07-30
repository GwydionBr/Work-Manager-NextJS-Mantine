"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TablesInsert } from "@/types/db.types";
import {
  secondsToTimerFormat,
  getRoundingInterval,
  getRoundedSeconds,
} from "@/utils/workHelperFunctions";
import {
  Currency,
  RoundingAmount,
  RoundingDirection,
} from "@/types/settings.types";

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
  hourlyPayment: boolean;
  projectId: string;
  userId: string;
  startTime: number | null;
  tempStartTime: number | null;
  activeSeconds: number;
  pausedSeconds: number;
  storedActiveSeconds: number;
  storedPausedSeconds: number;
  roundingInterval: number;
  roundingMode: RoundingDirection;

  restoreTimer: () => void;
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
    hourlyPayment: boolean,
    userId: string
  ) => void;
  setRoundingAmount: (
    roundingAmount: RoundingAmount,
    roundingMode: RoundingDirection,
    customRoundingAmount: number
  ) => void;
}

let intervalId: NodeJS.Timeout | null = null;

function startLoop(
  get: () => TimeTrackerState,
  set: (state: Partial<TimeTrackerState>) => void
) {
  if (intervalId) {
    clearInterval(intervalId);
  }

  const updateLoop = () => {
    const state = get();
    if (state.state === TimerState.Running) {
      const newActiveSeconds =
        Math.floor((Date.now() - (state.tempStartTime ?? 0)) / 1000) +
        state.storedActiveSeconds;
      const newActiveTime = secondsToTimerFormat(newActiveSeconds);
      set({
        activeSeconds: newActiveSeconds,
        activeTime: newActiveTime,
        moneyEarned: (
          (getRoundedSeconds(
            newActiveSeconds,
            state.roundingInterval,
            state.roundingMode
          ) /
            3600) *
          state.salary
        ).toFixed(2),
      });
      document.title = `${newActiveTime} - ${state.projectTitle} | Work Manager`;
    } else if (state.state === TimerState.Paused) {
      const newPausedSeconds =
        Math.floor((Date.now() - (state.tempStartTime ?? 0)) / 1000) +
        state.storedPausedSeconds;
      const newPausedTime = secondsToTimerFormat(newPausedSeconds);
      set({
        pausedSeconds: newPausedSeconds,
        pausedTime: newPausedTime,
      });
      document.title = `⏸️ ${state.activeTime} - ${state.projectTitle} | Work Manager`;
    }
  };

  intervalId = setInterval(updateLoop, 1000);
  updateLoop();
}

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
      hourlyPayment: false,
      projectId: "",
      userId: "",
      startTime: null,
      tempStartTime: null,
      activeSeconds: 0,
      pausedSeconds: 0,
      storedActiveSeconds: 0,
      storedPausedSeconds: 0,
      roundingInterval: 60,
      roundingMode: "up",

      restoreTimer: () => {
        startLoop(get, set);
      },

      configureProject: (
        projectId,
        projectTitle,
        currency,
        salary,
        hourlyPayment,
        userId
      ) => {
        if (get().state !== TimerState.Stopped) {
          return;
        }

        set({
          projectId,
          projectTitle,
          currency,
          salary,
          hourlyPayment,
          userId,
          moneyEarned: "0.00",
          activeTime: "00:00",
          pausedTime: "00:00",
          state: TimerState.Stopped,
        });
      },

      setRoundingAmount: (
        roundingAmount: RoundingAmount,
        roundingMode: RoundingDirection,
        customRoundingAmount: number
      ) => {
        set({
          roundingInterval: getRoundingInterval(
            roundingAmount,
            customRoundingAmount
          ),
          roundingMode,
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

        startLoop(get, set);
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

        startLoop(get, set);
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

        startLoop(get, set);
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
        const {
          userId,
          projectId,
          startTime,
          hourlyPayment,
          activeSeconds,
          pausedSeconds,
          salary,
          currency,
          roundingInterval,
          roundingMode,
        } = get();

        const roundedActiveSeconds = getRoundedSeconds(
          activeSeconds,
          roundingInterval,
          roundingMode
        );

        const newTimerSession: TablesInsert<"timerSession"> = {
          user_id: userId,
          project_id: projectId,
          start_time: new Date(startTime ?? 0).toISOString(),
          true_end_time: new Date().toISOString(),
          end_time: startTime
            ? new Date(
                startTime + (roundedActiveSeconds + pausedSeconds) * 1000
              ).toISOString()
            : new Date().toISOString(),
          hourly_payment: hourlyPayment,
          active_seconds: roundedActiveSeconds,
          paused_seconds: pausedSeconds,
          salary: salary,
          currency: currency,
        };

        return newTimerSession;
      },

      resetTimer: () => {},
    }),

    { name: "time-tracker-storage" }
  )
);
