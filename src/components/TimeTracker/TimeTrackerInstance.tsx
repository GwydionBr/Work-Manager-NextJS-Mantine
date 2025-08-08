"use client";

import { useState, useEffect, useCallback } from "react";
import { useTimeTracker } from "@/hooks/useTimeTracker";
import { useWorkStore } from "@/stores/workManagerStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Box, Transition } from "@mantine/core";
import TimeTrackerComponentBig from "./Big/TimeTrackerComponentBig";
import TimeTrackerComponentSmall from "./Small/TimeTrackerComponentSmall";
import { useTimeTrackerManager } from "@/stores/timeTrackerManagerStore";

import { getTimeSectionSessions } from "@/utils/workHelperFunctions";

import { TimerState } from "@/stores/timeTrackerStore";

interface TimeTrackerInstanceProps {
  timerId: string;
  isBig: boolean;
  isTimeTrackerMinimized: boolean;
  forceEndTimer: boolean;
  setIsTimeTrackerMinimized: (value: boolean) => void;
}

export default function TimeTrackerInstance({
  timerId,
  isBig,
  isTimeTrackerMinimized,
  forceEndTimer,
  setIsTimeTrackerMinimized,
}: TimeTrackerInstanceProps) {
  const [isClient, setIsClient] = useState(false);
  const timer = useTimeTrackerManager((state) => state.getTimer(timerId));
  const { updateTimer, removeTimer, setForceEndTimer, getAllTimers } =
    useTimeTrackerManager();
  const { addTimerSession, addMultipleTimerSessions } = useWorkStore();
  const { timeSectionInterval, roundInTimeSections } = useSettingsStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSmall, setShowSmall] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Funktion zum Beenden aller anderen laufenden Timer
  const stopOtherRunningTimers = useCallback(() => {
    const allTimers = getAllTimers();
    allTimers.forEach((otherTimer) => {
      if (
        otherTimer.id !== timerId &&
        otherTimer.state === TimerState.Running
      ) {
        setForceEndTimer(otherTimer.id, true);
      }
    });
  }, [timerId, getAllTimers, setForceEndTimer]);

  if (!timer) return null;

  const {
    state,
    activeTime,
    pausedTime,
    moneyEarned,
    roundedActiveTime,
    activeSeconds,
    pausedSeconds,
    startTime,
    tempStartTime,
    storedActiveSeconds,
    storedPausedSeconds,
    roundingMode,
    roundingInterval,
    modifyActiveSeconds,
    modifyPausedSeconds,
    getCurrentSession,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    cancelTimer,
    restoreTimer,
    setRoundingAmount,
  } = useTimeTracker({
    projectId: timer.projectId,
    projectTitle: timer.projectTitle,
    currency: timer.currency,
    salary: timer.salary,
    hourlyPayment: timer.hourlyPayment,
    userId: timer.userId,
    roundingInterval: timer.roundingInterval,
    roundingMode: timer.roundingMode,
    moneyEarned: timer.moneyEarned,
    activeTime: timer.activeTime,
    roundedActiveTime: timer.roundedActiveTime,
    pausedTime: timer.pausedTime,
    state: timer.state,
    activeSeconds: timer.activeSeconds,
    pausedSeconds: timer.pausedSeconds,
    startTime: timer.startTime,
    tempStartTime: timer.tempStartTime,
    storedActiveSeconds: timer.storedActiveSeconds,
    storedPausedSeconds: timer.storedPausedSeconds,
    timeSectionInterval: timeSectionInterval,
    roundInTimeSections: roundInTimeSections,
  });

  // Sync Hook state mit Store
  useEffect(() => {
    updateTimer(timerId, {
      state,
      activeTime,
      pausedTime,
      moneyEarned,
      activeSeconds,
      pausedSeconds,
      startTime,
      tempStartTime,
      storedActiveSeconds,
      storedPausedSeconds,
    });
  }, [
    state,
    activeTime,
    pausedTime,
    moneyEarned,
    timerId,
    updateTimer,
    activeSeconds,
    pausedSeconds,
    startTime,
    tempStartTime,
    storedActiveSeconds,
    storedPausedSeconds,
  ]);

  // Erweiterte startTimer Funktion, die andere Timer beendet
  const startTimerWithStopOthers = useCallback(() => {
    stopOtherRunningTimers();
    startTimer();
  }, [stopOtherRunningTimers, startTimer]);

  useEffect(() => {
    restoreTimer();
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (forceEndTimer) {
      submitTimer();
      setForceEndTimer(timerId, false);
    }
  }, [forceEndTimer]);

  if (!isClient) return null;

  async function submitTimer() {
    if (isSubmitting) return;
    let result = null;
    setIsSubmitting(true);
    setErrorMessage(null);
    const newSession = getCurrentSession();
    if (roundInTimeSections) {
      const newSessions = getTimeSectionSessions(
        new Date(newSession.start_time),
        new Date(newSession.end_time),
        timeSectionInterval,
        newSession
      );
      result = await addMultipleTimerSessions(
        newSessions,
        newSession.project_id as string
      );
    } else {
      result = await addTimerSession(newSession);
    }
    if (result) {
      stopTimer();
    } else {
      setErrorMessage("Error saving session");
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
    }
    setIsSubmitting(false);
  }

  return (
    <Box>
      <Transition
        mounted={isBig}
        transition="fade"
        duration={200}
        enterDelay={200}
      >
        {(styles) => (
          <div style={styles}>
            <TimeTrackerComponentBig
              projectTitle={timer.projectTitle}
              removeTimer={() => removeTimer(timerId)}
              moneyEarned={moneyEarned}
              currency={timer.currency}
              hourlyPayment={timer.hourlyPayment}
              roundedActiveTime={roundedActiveTime}
              state={state}
              activeTime={activeTime}
              pausedTime={pausedTime}
              activeSeconds={activeSeconds}
              roundingMode={roundingMode}
              roundingInterval={roundingInterval}
              salary={timer.salary}
              storedActiveSeconds={storedActiveSeconds}
              storedPausedSeconds={storedPausedSeconds}
              startTimer={startTimerWithStopOthers}
              pauseTimer={pauseTimer}
              resumeTimer={resumeTimer}
              cancelTimer={cancelTimer}
              isTimeTrackerMinimized={isTimeTrackerMinimized}
              setIsTimeTrackerMinimized={setIsTimeTrackerMinimized}
              errorMessage={errorMessage}
              isSubmitting={isSubmitting}
              submitTimer={submitTimer}
              modifyActiveSeconds={modifyActiveSeconds}
              modifyPausedSeconds={modifyPausedSeconds}
              setRoundingAmount={setRoundingAmount}
            />
          </div>
        )}
      </Transition>
      <Transition
        mounted={!isBig}
        transition="fade"
        duration={200}
        enterDelay={200}
      >
        {(styles) => (
          <div style={styles}>
            <TimeTrackerComponentSmall
              roundedActiveTime={roundedActiveTime}
              state={state}
              activeTime={activeTime}
              pausedTime={pausedTime}
              activeSeconds={activeSeconds}
              roundingMode={roundingMode}
              roundingInterval={roundingInterval}
              projectTitle={timer.projectTitle}
              salary={timer.salary}
              currency={timer.currency}
              hourlyPayment={timer.hourlyPayment}
              storedActiveSeconds={storedActiveSeconds}
              storedPausedSeconds={storedPausedSeconds}
              modifyActiveSeconds={modifyActiveSeconds}
              modifyPausedSeconds={modifyPausedSeconds}
              setRoundingAmount={setRoundingAmount}
              showSmall={showSmall}
              setShowSmall={setShowSmall}
              isSubmitting={isSubmitting}
              submitTimer={submitTimer}
              startTimer={startTimerWithStopOthers}
              pauseTimer={pauseTimer}
              resumeTimer={resumeTimer}
              cancelTimer={cancelTimer}
            />
          </div>
        )}
      </Transition>
    </Box>
  );
}
