"use client";

import { useState, useEffect } from "react";
import { useTimeTracker } from "@/hooks/useTimeTracker";

import { Box, Transition } from "@mantine/core";
import TimeTrackerComponentBig from "./NewTimeTrackerComponentBig";
import TimeTrackerComponentSmall from "./NewTimeTrackerComponentSmall";
import { useTimeTrackerManager } from "@/stores/timeTrackerManagerStore";

interface TimeTrackerComponentProps {
  timerId: string;
  isBig: boolean;
  isTimeTrackerMinimized: boolean;
  setIsTimeTrackerMinimized: (value: boolean) => void;
}

export default function TimeTrackerComponent({
  timerId,
  isBig,
  isTimeTrackerMinimized,
  setIsTimeTrackerMinimized,
}: TimeTrackerComponentProps) {
  const [isClient, setIsClient] = useState(false);
  const timer = useTimeTrackerManager((state) => state.getTimer(timerId));
  const updateTimer = useTimeTrackerManager((state) => state.updateTimer);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSmall, setShowSmall] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!timer) return null;

  const {
    state,
    activeTime,
    pausedTime,
    moneyEarned,
    roundedActiveTime,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    cancelTimer,
    restoreTimer,
  } = useTimeTracker(
    {
      projectId: timer.projectId,
      projectTitle: timer.projectTitle,
      currency: timer.currency,
      salary: timer.salary,
      hourlyPayment: timer.hourlyPayment,
      userId: timer.userId,
      roundingInterval: timer.roundingInterval,
      roundingMode: timer.roundingMode,
    },
    {
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
    }
  );

  useEffect(() => {
    restoreTimer();
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const getStatusColor = () => {
    switch (state) {
      case "running":
        return "lime";
      case "paused":
        return "yellow";
      case "stopped":
        return "teal.6";
      default:
        return "blue";
    }
  };

  async function submitTimer() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    // setErrorMessage(null);
    // const newSession = getCurrentSession();

    // const result = await addTimerSession(newSession);
    // if (result) {
    //   stopTimer();
    // } else {
    //   setErrorMessage("Error saving session");
    //   setTimeout(() => {
    //     setErrorMessage(null);
    //   }, 3000);
    // }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    stopTimer();
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
              moneyEarned={moneyEarned}
              currency={timer.currency}
              hourlyPayment={timer.hourlyPayment}
              roundedActiveTime={roundedActiveTime}
              state={state}
              activeTime={activeTime}
              pausedTime={pausedTime}
              startTimer={startTimer}
              pauseTimer={pauseTimer}
              resumeTimer={resumeTimer}
              cancelTimer={cancelTimer}
              isTimeTrackerMinimized={isTimeTrackerMinimized}
              setIsTimeTrackerMinimized={setIsTimeTrackerMinimized}
              errorMessage={errorMessage}
              isSubmitting={isSubmitting}
              submitTimer={submitTimer}
              getStatusColor={getStatusColor}
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
              showSmall={showSmall}
              setShowSmall={setShowSmall}
              isSubmitting={isSubmitting}
              submitTimer={submitTimer}
              getStatusColor={getStatusColor}
              startTimer={startTimer}
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
