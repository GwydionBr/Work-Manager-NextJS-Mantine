"use client";

import { TimerState } from "@/types/timeTracker.types";

import { Stack, Collapse } from "@mantine/core";
import {
  Currency,
  RoundingAmount,
  RoundingDirection,
} from "@/types/settings.types";
import TimeTrackerComponentBigMin from "./TimeTrackerComponentBigMin";
import TimeTrackerComponentBigMax from "./TimeTrackerComponentBigMax";

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
  memo: string;
  color: string | null;
  backgroundColor: string;
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
  setMemo: (memo: string) => void;
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
  memo,
  color,
  backgroundColor,
  removeTimer,
  submitTimer,
  startTimer,
  pauseTimer,
  resumeTimer,
  cancelTimer,
  modifyActiveSeconds,
  modifyPausedSeconds,
  setRoundingAmount,
  setMemo,
}: TimeTrackerComponentBigProps) {
  return (
    <Stack align="center" w="100%">
      <Collapse in={isTimeTrackerMinimized} transitionDuration={400}>
        <TimeTrackerComponentBigMin
          projectTitle={projectTitle}
          state={state}
          activeTime={activeTime}
          pausedTime={pausedTime}
          roundedActiveTime={roundedActiveTime}
          isSubmitting={isSubmitting}
          activeSeconds={activeSeconds}
          storedActiveSeconds={storedActiveSeconds}
          storedPausedSeconds={storedPausedSeconds}
          roundingMode={roundingMode}
          roundingInterval={roundingInterval}
          currency={currency}
          salary={salary}
          hourlyPayment={hourlyPayment}
          startTimer={startTimer}
          pauseTimer={pauseTimer}
          resumeTimer={resumeTimer}
          submitTimer={submitTimer}
          cancelTimer={cancelTimer}
          removeTimer={removeTimer}
          modifyActiveSeconds={modifyActiveSeconds}
          modifyPausedSeconds={modifyPausedSeconds}
          setRoundingAmount={setRoundingAmount}
          color={color}
          backgroundColor={backgroundColor}
        />
      </Collapse>
      <Collapse in={!isTimeTrackerMinimized} transitionDuration={400}>
        <TimeTrackerComponentBigMax
          projectTitle={projectTitle}
          state={state}
          memo={memo}
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
          color={color}
          backgroundColor={backgroundColor}
          startTimer={startTimer}
          pauseTimer={pauseTimer}
          resumeTimer={resumeTimer}
          submitTimer={submitTimer}
          cancelTimer={cancelTimer}
          modifyActiveSeconds={modifyActiveSeconds}
          modifyPausedSeconds={modifyPausedSeconds}
          setRoundingAmount={setRoundingAmount}
          removeTimer={removeTimer}
          setMemo={setMemo} 
        />
      </Collapse>
    </Stack>
  );
}
