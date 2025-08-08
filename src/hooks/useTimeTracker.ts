"use client";

// src/hooks/useTimeTracker.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { TimerState } from "@/stores/timeTrackerStore";
import {
  secondsToTimerFormat,
  getRoundedSeconds,
  getRoundingInterval,
} from "@/utils/workHelperFunctions";
import {
  Currency,
  RoundingAmount,
  RoundingDirection,
} from "@/types/settings.types";
import { TablesInsert } from "@/types/db.types";

interface TimeTrackerState {
  projectId: string;
  projectTitle: string;
  currency: Currency;
  salary: number;
  hourlyPayment: boolean;
  userId: string;
  roundingInterval: number;
  roundingMode: RoundingDirection;
  timeSectionInterval: number;
  roundInTimeSections: boolean;
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

export function useTimeTracker(initialState: TimeTrackerState) {
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
              prevState.roundingInterval,
              prevState.roundingMode
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
                prevState.roundingInterval,
                prevState.roundingMode
              ) /
                3600) *
              prevState.salary
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
  }, [
    state.roundingInterval,
    state.roundingMode,
    state.salary,
    state.tempStartTime,
    state.storedActiveSeconds,
    state.storedPausedSeconds,
  ]);

  // Timer-Aktionen

  const modifyActiveSeconds = useCallback(
    (delta: number) => {
      const newActiveSeconds = Math.max(0, state.activeSeconds + delta);

      if (state.state !== TimerState.Running) {
        setState((prev) => ({
          ...prev,
          storedActiveSeconds: newActiveSeconds,
          activeTime: secondsToTimerFormat(newActiveSeconds),
          activeSeconds: newActiveSeconds,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          activeSeconds: newActiveSeconds,
          activeTime: secondsToTimerFormat(newActiveSeconds),
          storedActiveSeconds: newActiveSeconds,
          tempStartTime: Date.now(),
        }));
      }
    },
    [state.state, state.activeSeconds]
  );

  const modifyPausedSeconds = useCallback(
    (delta: number) => {
      const newPausedSeconds = Math.max(0, state.pausedSeconds + delta);

      if (state.state !== TimerState.Paused) {
        setState((prev) => ({
          ...prev,
          storedPausedSeconds: newPausedSeconds,
          pausedTime: secondsToTimerFormat(newPausedSeconds),
          pausedSeconds: newPausedSeconds,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          pausedSeconds: newPausedSeconds,
          pausedTime: secondsToTimerFormat(newPausedSeconds),
          storedPausedSeconds: newPausedSeconds,
          tempStartTime: Date.now(),
        }));
      }
    },
    [state.state, state.pausedSeconds]
  );

  const restoreTimer = useCallback(() => {
    startLoop();
  }, [startLoop]);

  const configureProject = useCallback(
    (
      projectId: string,
      projectTitle: string,
      currency: Currency,
      salary: number,
      hourlyPayment: boolean,
      userId: string
    ) => {
      if (state.state !== TimerState.Stopped) return;

      setState((prev) => ({
        ...prev,
        projectId,
        projectTitle,
        currency,
        salary,
        hourlyPayment,
        userId,
      }));
    },
    [state.state]
  );

  const startTimer = useCallback(() => {
    if (state.state !== TimerState.Stopped || !state.projectTitle) return;

    setState((prev) => ({
      ...prev,
      state: TimerState.Running,
      startTime: Date.now(),
      tempStartTime: Date.now(),
    }));
    startLoop();
  }, [state.state, state.projectTitle, startLoop]);

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

  const setRoundingAmount = useCallback(
    (
      roundingAmount: RoundingAmount,
      roundingMode: RoundingDirection,
      customRoundingAmount: number
    ) => {
      setState((prev) => ({
        ...prev,
        roundingInterval: getRoundingInterval(
          roundingAmount,
          customRoundingAmount
        ),
        roundingMode,
      }));
    },
    [state.roundingInterval, state.roundingMode, state.salary]
  );

  const getCurrentSession = useCallback(() => {
    const currentActiveSeconds = state.roundInTimeSections
      ? state.activeSeconds
      : getRoundedSeconds(
          state.activeSeconds,
          state.roundingInterval,
          state.roundingMode
        );

    const newTimerSession: TablesInsert<"timerSession"> = {
      user_id: state.userId,
      project_id: state.projectId,
      start_time: new Date(state.startTime ?? 0).toISOString(),
      true_end_time: new Date().toISOString(),
      end_time: state.startTime
        ? new Date(
            state.startTime +
              (currentActiveSeconds + state.pausedSeconds) * 1000
          ).toISOString()
        : new Date().toISOString(),
      hourly_payment: state.hourlyPayment,
      active_seconds: currentActiveSeconds,
      paused_seconds: state.pausedSeconds,
      salary: state.salary,
      currency: state.currency,
    };

    return newTimerSession;
  }, [
    state.roundingInterval,
    state.roundingMode,
    state.salary,
    state.currency,
    state.hourlyPayment,
    state.userId,
    state.projectId,
    state.startTime,
    state.activeSeconds,
    state.pausedSeconds,
  ]);

  return {
    ...state,
    configureProject,
    restoreTimer,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    cancelTimer,
    getCurrentSession,
    modifyActiveSeconds,
    modifyPausedSeconds,
    setRoundingAmount,
  };
}
