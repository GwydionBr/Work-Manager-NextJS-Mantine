"use client";

import { useEffect, useState } from "react";
import { useTimeTrackerManager } from "@/stores/timeTrackerManagerStore";
import { useWorkStore } from "@/stores/workManagerStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Alert, Stack, Text } from "@mantine/core";
import { TimerState } from "@/stores/timeTrackerStore";
import NewTimeTrackerInstance from "./NewTimeTrackerInstance";
import PlusActionIcon from "@/components/UI/ActionIcons/PlusActionIcon";
import { Currency } from "@/types/settings.types";
import TimeTrackerActionIcon from "../TimeTrackerActionIcons/TimeTrackerActionIcon";
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
  const { getAllTimers, addTimer } = useTimeTrackerManager();
  const { activeProjectId } = useWorkStore();
  const { roundingAmount, roundingMode, customRoundingAmount } =
    useSettingsStore();
  const activeProject = useWorkStore((state) =>
    state.projects.find((p) => p.project.id === activeProjectId)
  );
  const timers = getAllTimers();

  const handleAddTimer = (
    projectId: string,
    projectTitle: string,
    currency: Currency,
    salary: number,
    hourlyPayment: boolean,
    userId: string
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
            activeProject.project.user_id
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
        <NewTimeTrackerInstance
          key={timer.id}
          timerId={timer.id}
          isBig={isBig}
          isTimeTrackerMinimized={isTimeTrackerMinimized}
          setIsTimeTrackerMinimized={setIsTimeTrackerMinimized}
        />
      ))}
    </Stack>
  );
}
