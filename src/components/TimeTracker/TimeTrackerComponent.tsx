"use client";

import { useState, useEffect } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useTimeTracker } from "@/stores/timeTrackerStore";
import { useWorkStore } from "@/stores/workManagerStore";

import { Box, Transition } from "@mantine/core";
import TimeTrackerComponentBig from "./TimeTrackerComponentBig";
import TimeTrackerComponentSmall from "./TimeTrackerComponentSmall";

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
    hourlyPayment,
    startTimer,
    pauseTimer,
    resumeTimer,
    getCurrentSession,
    stopTimer,
    cancelTimer,
    configureProject,
    setRoundingAmount,
    restoreTimer,
  } = useTimeTracker();

  const { roundingAmount, roundingMode, customRoundingAmount } =
    useSettingsStore();
  const { addTimerSession, activeProjectId } = useWorkStore();
  const activeProject = useWorkStore((state) =>
    state.projects.find((p) => p.project.id === activeProjectId)
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSmall, setShowSmall] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activeProject) {
      configureProject(
        activeProject.project.id,
        activeProject.project.title,
        activeProject.project.currency,
        activeProject.project.salary,
        activeProject.project.hourly_payment,
        activeProject.project.user_id
      );
    }
  }, [activeProject]);

  useEffect(() => {
    restoreTimer();
    console.log("restoreTimer");
  }, []);

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
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    const newSession = getCurrentSession();

    const result = await addTimerSession(newSession);
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
              isTimeTrackerMinimized={isTimeTrackerMinimized}
              setIsTimeTrackerMinimized={setIsTimeTrackerMinimized}
              state={state}
              projectTitle={projectTitle}
              moneyEarned={moneyEarned}
              activeTime={activeTime}
              pausedTime={pausedTime}
              currency={currency}
              hourlyPayment={hourlyPayment}
              errorMessage={errorMessage}
              isSubmitting={isSubmitting}
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
              isSubmitting={isSubmitting}
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
