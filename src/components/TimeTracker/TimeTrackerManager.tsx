"use client";

import { useEffect, useState } from "react";
import { useTimeTrackerManager } from "@/stores/timeTrackerManagerStore";
import { useWorkStore } from "@/stores/workManagerStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Alert, Stack, Text } from "@mantine/core";
import { TimerState } from "@/stores/timeTrackerStore";
import TimeTrackerInstance from "./TimeTrackerInstance";
import PlusActionIcon from "@/components/UI/ActionIcons/PlusActionIcon";
import { Currency } from "@/types/settings.types";
import TimeTrackerActionIcon from "./TimeTrackerActionIcons/TimeTrackerActionIcon";
import {
  getRoundingInterval,
  getStatusColor,
} from "@/utils/workHelperFunctions";

interface TimerManagerProps {
  isBig: boolean;
  isTimeTrackerMinimized: boolean;
  setIsTimeTrackerMinimized: (value: boolean) => void;
}

export default function TimerManager({
  isBig,
  isTimeTrackerMinimized,
  setIsTimeTrackerMinimized,
}: TimerManagerProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { getAllTimers, addTimer } = useTimeTrackerManager();
  const { activeProjectId } = useWorkStore();
  const { roundingAmount, roundingMode, customRoundingAmount } =
    useSettingsStore();
  const activeProject = useWorkStore((state) =>
    state.projects.find((p) => p.project.id === activeProjectId)
  );
  const timers = getAllTimers();

  // Client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddTimer = (
    projectId: string,
    projectTitle: string,
    currency: Currency,
    salary: number,
    hourlyPayment: boolean,
    userId: string,
    color: string | null
  ) => {
    const result = addTimer({
      projectId: projectId,
      projectTitle: projectTitle,
      currency: currency,
      salary: salary,
      hourlyPayment: hourlyPayment,
      userId: userId,
      roundingInterval: getRoundingInterval(
        roundingAmount,
        customRoundingAmount
      ),
      color: color,
      roundingMode: roundingMode,
      state: TimerState.Stopped,
      activeSeconds: 0,
      pausedSeconds: 0,
      startTime: null,
      tempStartTime: null,
      storedActiveSeconds: 0,
      storedPausedSeconds: 0,
      moneyEarned: "0.00",
      activeTime: "00:00",
      roundedActiveTime: "00:00",
      pausedTime: "00:00",
      forceEndTimer: false,
    });

    if (!result.success) {
      setErrorMessage(result.error || "Failed to add timer");
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    }
  };

  useEffect(() => {
    if (timers.length === 0) {
      if (!activeProject) return;
      const result = addTimer({
        projectId: activeProject.project.id,
        projectTitle: activeProject.project.title,
        currency: activeProject.project.currency,
        salary: activeProject.project.salary,
        hourlyPayment: activeProject.project.hourly_payment,
        userId: activeProject.project.user_id,
        roundingInterval: getRoundingInterval(
          roundingAmount,
          customRoundingAmount
        ),
        color: activeProject.project.color,
        roundingMode: roundingMode,
        state: TimerState.Stopped,
        activeSeconds: 0,
        pausedSeconds: 0,
        startTime: null,
        tempStartTime: null,
        storedActiveSeconds: 0,
        storedPausedSeconds: 0,
        moneyEarned: "0.00",
        activeTime: "00:00",
        roundedActiveTime: "00:00",
        pausedTime: "00:00",
        forceEndTimer: false,
      });

      if (!result.success) {
        setErrorMessage(result.error || "Failed to add timer");
        setTimeout(() => {
          setErrorMessage(null);
        }, 5000);
      }
    }
  }, [timers, addTimer]);

  const isOneTimerRunning = timers.some(
    (timer) => timer.state === TimerState.Running
  );
  const isOneTimerPaused = timers.some(
    (timer) => timer.state === TimerState.Paused
  );

  const mainTimerStatus = isOneTimerRunning
    ? TimerState.Running
    : isOneTimerPaused
      ? TimerState.Paused
      : TimerState.Stopped;

  const activeTimerCount = timers.filter(
    (timer) =>
      timer.state === TimerState.Running || timer.state === TimerState.Paused
  ).length;

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return (
      <Stack align="center" gap="md" mb="md">
        <PlusActionIcon onClick={() => {}} />
        <TimeTrackerActionIcon
          action={() => {}}
          label="hide Timer"
          indicatorLabel="0"
          state={TimerState.Stopped}
          getStatusColor={() => getStatusColor(TimerState.Stopped)}
        />
      </Stack>
    );
  }

  return (
    <Stack align="center" gap="md" mb="md">
      {errorMessage && (
        <Alert
          color="red"
          variant="filled"
          title="Error"
          withCloseButton
          onClose={() => setErrorMessage(null)}
        >
          <Text>{errorMessage}</Text>
        </Alert>
      )}

      <PlusActionIcon
        onClick={() => {
          if (!activeProject) return;
          handleAddTimer(
            activeProject.project.id,
            activeProject.project.title,
            activeProject.project.currency,
            activeProject.project.salary,
            activeProject.project.hourly_payment,
            activeProject.project.user_id,
            activeProject.project.color
          );
        }}
      />
      <TimeTrackerActionIcon
        action={() => setIsTimeTrackerMinimized(!isTimeTrackerMinimized)}
        label={isTimeTrackerMinimized ? "show Timer" : "hide Timer"}
        indicatorLabel={activeTimerCount.toString()}
        state={mainTimerStatus}
        getStatusColor={() => getStatusColor(mainTimerStatus)}
      />

      {timers.map((timer) => (
        <TimeTrackerInstance
          key={timer.id}
          timerId={timer.id}
          isBig={isBig}
          isTimeTrackerMinimized={isTimeTrackerMinimized}
          setIsTimeTrackerMinimized={setIsTimeTrackerMinimized}
          forceEndTimer={timer.forceEndTimer}
        />
      ))}
    </Stack>
  );
}
