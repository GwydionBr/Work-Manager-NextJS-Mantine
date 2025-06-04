"use client";

import { useState, useEffect } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useTimeTracker } from "@/stores/timeTrackerStore";
import { useWorkStore } from "@/stores/workManagerStore";

import { Box, Transition } from "@mantine/core";
import TimeTrackerComponentBig from "./TimeTrackerComponentBig";
import TimeTrackerComponentSmall from "./TimeTrackerComponentSmall";

import {
  getRoundedSeconds,
  getRoundingInterval,
} from "@/utils/workHelperFunctions";

interface TimeTrackerComponentProps {
  isBig: boolean;
  isTimeTrackerMinimized: boolean;
  setIsTimeTrackerMinimized: (value: boolean) => void;
}

export default function TimeTrackerComponent({
  isBig,
  isTimeTrackerMinimized,
  setIsTimeTrackerMinimized,
}: TimeTrackerComponentProps) {
  const {
    projectTitle,
    moneyEarned,
    activeTime,
    pausedTime,
    currency,
    state,
    startTimer,
    pauseTimer,
    resumeTimer,
    getCurrentSession,
    stopTimer,
    cancelTimer,
    configureProject,
    setRoundingAmount,
  } = useTimeTracker();

  const { roundingAmount, roundingMode, customRoundingAmount } =
    useSettingsStore();
  const { addTimerSession, activeProject } = useWorkStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSmall, setShowSmall] = useState(true);

  useEffect(() => {
    if (activeProject) {
      configureProject(
        activeProject.project.id,
        activeProject.project.title,
        activeProject.project.currency,
        activeProject.project.salary,
        activeProject.project.user_id
      );
    }
  }, [activeProject]);

  useEffect(() => {
    setRoundingAmount(roundingAmount, roundingMode, customRoundingAmount);
  }, [roundingAmount, roundingMode, customRoundingAmount]);

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
    setErrorMessage(null);
    const newSession = getCurrentSession();
    const roundingInterval = getRoundingInterval(
      roundingAmount,
      customRoundingAmount
    );

    newSession.active_seconds = getRoundedSeconds(
      newSession.active_seconds,
      roundingInterval,
      roundingMode
    );
    pauseTimer();
    const result = await addTimerSession(newSession);
    if (result) {
      stopTimer();
    } else {
      setErrorMessage("Error saving session");
    }
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
              isTimeTrackerMinimized={isTimeTrackerMinimized}
              setIsTimeTrackerMinimized={setIsTimeTrackerMinimized}
              state={state}
              projectTitle={projectTitle}
              moneyEarned={moneyEarned}
              activeTime={activeTime}
              pausedTime={pausedTime}
              currency={currency}
              errorMessage={errorMessage}
              startTimer={startTimer}
              pauseTimer={pauseTimer}
              resumeTimer={resumeTimer}
              submitTimer={submitTimer}
              cancelTimer={cancelTimer}
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
              showSmall={showSmall}
              setShowSmall={setShowSmall}
              state={state}
              activeTime={activeTime}
              pausedTime={pausedTime}
              startTimer={startTimer}
              pauseTimer={pauseTimer}
              resumeTimer={resumeTimer}
              submitTimer={submitTimer}
              cancelTimer={cancelTimer}
              getStatusColor={getStatusColor}
            />
          </div>
        )}
      </Transition>
    </Box>
  );
}
