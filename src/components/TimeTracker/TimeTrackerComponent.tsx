"use client";

import { useState, useEffect } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useTimeTracker } from "@/stores/timeTrackerStore";
import { useWorkStore } from "@/stores/workManagerStore";

import { Transition } from "@mantine/core";
import TimeTrackerComponentBig from "./TimeTrackerComponentBig";
import TimeTrackerComponentSmall from "./TimeTrackerComponentSmall";

import { roundTime } from "@/utils/workHelperFunctions";

export default function TimeTrackerComponent({ isBig }: { isBig: boolean }) {
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
  } = useTimeTracker();

  const { roundingAmount, roundingMode } = useSettingsStore();
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

  const getStatusColor = () => {
    switch (state) {
      case "running":
        return "green";
      case "paused":
        return "yellow";
      case "stopped":
        return "gray";
      default:
        return "blue";
    }
  };

  async function submitTimer() {
    setErrorMessage(null);
    const newSession = getCurrentSession();
    newSession.active_seconds = roundTime(
      newSession.active_seconds,
      roundingAmount,
      roundingMode
    );
    pauseTimer();
    const result = await addTimerSession(newSession);
    if (result) {
      stopTimer();
    } else {
      setErrorMessage("Fehler beim Speichern der Session");
    }
  }

  return (
    <>
      <Transition
        mounted={isBig}
        transition="fade"
        duration={200}
        enterDelay={200}
      >
        {(styles) => (
          <div style={styles}>
            <TimeTrackerComponentBig
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
    </>
  );
}
