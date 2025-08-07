"use client";

import { TimerState } from "@/stores/timeTrackerStore";

import { Stack, Collapse } from "@mantine/core";
import {
  Currency,
  RoundingAmount,
  RoundingDirection,
} from "@/types/settings.types";
import NewTimeTrackerComponentBigMin from "./NewTimeTrackerComponentBigMin";
import NewTimeTrackerComponentBigMax from "./NewTimeTrackerComponentBigMax";

interface TimeTrackerComponentBigProps {
  projectTitle: string;
  isTimeTrackerMinimized: boolean;
  errorMessage: string | null;
  isSubmitting: boolean;
  moneyEarned: string;
  currency: Currency;
  salary: number;
  hourlyPayment: boolean;
  roundedActiveTime: string;
  state: TimerState;
  activeTime: string;
  pausedTime: string;
  activeSeconds: number;
  roundingMode: RoundingDirection;
  roundingInterval: number;
  storedActiveSeconds: number;
  storedPausedSeconds: number;
  removeTimer: () => void;
  submitTimer: () => void;
  setIsTimeTrackerMinimized: (value: boolean) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  cancelTimer: () => void;
  modifyActiveSeconds: (delta: number) => void;
  modifyPausedSeconds: (delta: number) => void;
  setRoundingAmount: (
    roundingAmount: RoundingAmount,
    roundingMode: RoundingDirection,
    customRoundingAmount: number
  ) => void;
}

export default function TimeTrackerComponentBig({
  projectTitle,
  state,
  activeTime,
  pausedTime,
  activeSeconds,
  roundedActiveTime,
  isTimeTrackerMinimized,
  errorMessage,
  isSubmitting,
  storedActiveSeconds,
  storedPausedSeconds,
  roundingMode,
  roundingInterval,
  salary,
  moneyEarned,
  currency,
  hourlyPayment,
  removeTimer,
  submitTimer,
  startTimer,
  pauseTimer,
  resumeTimer,
  cancelTimer,
  modifyActiveSeconds,
  modifyPausedSeconds,
  setRoundingAmount,
}: TimeTrackerComponentBigProps) {
  return (
    <Stack align="center" w="100%">
      <Collapse in={isTimeTrackerMinimized} transitionDuration={400}>
        <NewTimeTrackerComponentBigMin
          projectTitle={projectTitle}
          state={state}
          activeTime={activeTime}
          pausedTime={pausedTime}
          roundedActiveTime={roundedActiveTime}
          isSubmitting={isSubmitting}
          startTimer={startTimer}
          pauseTimer={pauseTimer}
          resumeTimer={resumeTimer}
          submitTimer={submitTimer}
          cancelTimer={cancelTimer}
          removeTimer={removeTimer}
        />
      </Collapse>
      <Collapse in={!isTimeTrackerMinimized} transitionDuration={400}>
        <NewTimeTrackerComponentBigMax
          projectTitle={projectTitle}
          state={state}
          activeSeconds={activeSeconds}
          activeTime={activeTime}
          pausedTime={pausedTime}
          roundedActiveTime={roundedActiveTime}
          isSubmitting={isSubmitting}
          moneyEarned={moneyEarned}
          storedActiveSeconds={storedActiveSeconds}
          storedPausedSeconds={storedPausedSeconds}
          roundingMode={roundingMode}
          roundingInterval={roundingInterval}
          currency={currency}
          salary={salary}
          hourlyPayment={hourlyPayment}
          errorMessage={errorMessage}
          startTimer={startTimer}
          pauseTimer={pauseTimer}
          resumeTimer={resumeTimer}
          submitTimer={submitTimer}
          cancelTimer={cancelTimer}
          modifyActiveSeconds={modifyActiveSeconds}
          modifyPausedSeconds={modifyPausedSeconds}
          setRoundingAmount={setRoundingAmount}
          removeTimer={removeTimer}
        />
      </Collapse>
    </Stack>
  );
}
