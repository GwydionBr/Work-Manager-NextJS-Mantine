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

// BroadcastChannel for timer synchronization across tabs
const timerChannel = new BroadcastChannel("timer-sync");
const tabId = crypto.randomUUID(); // eindeutige ID für jeden Tab

export default function TimeTrackerComponent({
  isBig,
  isTimeTrackerMinimized,
  setIsTimeTrackerMinimized,
}: TimeTrackerComponentProps) {
  const {
    state,
    roundingInterval: timeTrackerRoundingInterval,
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
    const handleMessage = (event: MessageEvent) => {
      const { type, payload, sender } = event.data;
      if (sender === tabId) return; // Ignore messages from the same tab

      switch (type) {
        case "timer-stopped":
          cancelTimer();
          break;
      }
    };

    timerChannel.addEventListener("message", handleMessage);
    return () => {
      timerChannel.removeEventListener("message", handleMessage);
    };
  }, []);

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

  function handleCancelTimer() {
    cancelTimer();
    timerChannel.postMessage({ type: "timer-stopped", sender: tabId });
  }

  async function submitTimer() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    const newSession = getCurrentSession();

    const result = await addTimerSession(newSession);
    if (result) {
      timerChannel.postMessage({ type: "timer-stopped", sender: tabId });
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
              showSmall={showSmall}
              setShowSmall={setShowSmall}
              isSubmitting={isSubmitting}
              submitTimer={submitTimer}
              getStatusColor={getStatusColor}
            />
          </div>
        )}
      </Transition>
    </Box>
  );
}
