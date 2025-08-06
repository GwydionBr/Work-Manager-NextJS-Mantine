"use client";

// src/hooks/useTimeTracker.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { TimerState } from "@/stores/timeTrackerStore";
import {
  secondsToTimerFormat,
  getRoundedSeconds,
} from "@/utils/workHelperFunctions";
import { Currency, RoundingDirection } from "@/types/settings.types";

interface TimeTrackerConfig {
  projectId: string;
  projectTitle: string;
  currency: Currency;
  salary: number;
  hourlyPayment: boolean;
  userId: string;
  roundingInterval: number;
  roundingMode: RoundingDirection;
}

interface TimeTrackerState {
  moneyEarned: string;
  activeTime: string;
  roundedActiveTime: string;
  pausedTime: string;
  state: TimerState;
  activeSeconds: number;
  pausedSeconds: number;
  startTime: number | null;
  tempStartTime: number | null;
  storedActiveSeconds: number;
  storedPausedSeconds: number;
}

export function useTimeTracker(
  config: TimeTrackerConfig,
  initialState: TimeTrackerState
) {
  const [state, setState] = useState<TimeTrackerState>(initialState);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer-Loop Funktion
  const startLoop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const updateLoop = () => {
      setState((prevState) => {
        if (prevState.state === TimerState.Running) {
          const newActiveSeconds =
            Math.floor((Date.now() - (prevState.tempStartTime ?? 0)) / 1000) +
            prevState.storedActiveSeconds;

          const newActiveTime = secondsToTimerFormat(newActiveSeconds);
          const newRoundedActiveTime = secondsToTimerFormat(
            getRoundedSeconds(
              newActiveSeconds,
              config.roundingInterval,
              config.roundingMode
            )
          );

          return {
            ...prevState,
            activeSeconds: newActiveSeconds,
            activeTime: newActiveTime,
            roundedActiveTime: newRoundedActiveTime,
            moneyEarned: (
              (getRoundedSeconds(
                newActiveSeconds,
                config.roundingInterval,
                config.roundingMode
              ) /
                3600) *
              config.salary
            ).toFixed(2),
          };
        } else if (prevState.state === TimerState.Paused) {
          const newPausedSeconds =
            Math.floor((Date.now() - (prevState.tempStartTime ?? 0)) / 1000) +
            prevState.storedPausedSeconds;

          const newPausedTime = secondsToTimerFormat(newPausedSeconds);

          return {
            ...prevState,
            pausedSeconds: newPausedSeconds,
            pausedTime: newPausedTime,
          };
        }
        return prevState;
      });
    };

    intervalRef.current = setInterval(updateLoop, 1000);
    updateLoop();
  }, [config.roundingInterval, config.roundingMode, config.salary]);

  // Timer-Aktionen

  const restoreTimer = useCallback(() => {
    startLoop();
  }, [startLoop]);

  const startTimer = useCallback(() => {
    if (state.state !== TimerState.Stopped || !config.projectTitle) return;

    setState((prev) => ({
      ...prev,
      state: TimerState.Running,
      startTime: Date.now(),
      tempStartTime: Date.now(),
    }));
    startLoop();
  }, [state.state, config.projectTitle, startLoop]);

  const pauseTimer = useCallback(() => {
    if (state.state !== TimerState.Running) return;

    setState((prev) => ({
      ...prev,
      state: TimerState.Paused,
      storedActiveSeconds: prev.activeSeconds,
      tempStartTime: Date.now(),
    }));
    startLoop();
  }, [state.state, startLoop]);

  const resumeTimer = useCallback(() => {
    if (state.state !== TimerState.Paused) return;

    setState((prev) => ({
      ...prev,
      state: TimerState.Running,
      storedPausedSeconds: prev.pausedSeconds,
      tempStartTime: Date.now(),
    }));
    startLoop();
  }, [state.state, startLoop]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      state: TimerState.Stopped,
      moneyEarned: "0.00",
      activeTime: "00:00",
      roundedActiveTime: "00:00",
      pausedTime: "00:00",
      activeSeconds: 0,
      pausedSeconds: 0,
      startTime: null,
      tempStartTime: null,
      storedActiveSeconds: 0,
      storedPausedSeconds: 0,
    }));
  }, []);

  const cancelTimer = useCallback(() => {
    stopTimer();
  }, [stopTimer]);

  // Cleanup bei Unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    restoreTimer,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    cancelTimer,
    config,
  };
}
