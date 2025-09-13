"use client";

import { useEffect, useState } from "react";
import {
  TimerData,
  useTimeTrackerManager,
} from "@/stores/timeTrackerManagerStore";
import { useWorkStore } from "@/stores/workManagerStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Alert, Stack, Text } from "@mantine/core";
import { TimerRoundingSettings, TimerState } from "@/types/timeTracker.types";
import TimeTrackerInstance from "./TimeTrackerInstance";
import PlusActionIcon from "@/components/UI/ActionIcons/PlusActionIcon";
import { Currency } from "@/types/settings.types";
import TimeTrackerActionIcon from "./TimeTrackerActionIcons/TimeTrackerActionIcon";
import { getStatusColor } from "@/utils/workHelperFunctions";

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
  const { getAllTimers, addTimer, timers: timerData } = useTimeTrackerManager();
  const { activeProjectId } = useWorkStore();
  const { timerRoundingSettings, locale } = useSettingsStore();
  const activeProject = useWorkStore((state) =>
    state.projects.find((p) => p.project.id === activeProjectId)
  );
  const [timers, setTimers] = useState<TimerData[]>([]);

  useEffect(() => {
    setTimers(getAllTimers());
  }, [timerData, getAllTimers]);

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
    timerRoundingSettings: TimerRoundingSettings
  ) => {
    const result = addTimer({
      projectId: projectId,
      projectTitle: projectTitle,
      currency: currency,
      salary: salary,
      hourlyPayment: hourlyPayment,
      userId: userId,
      timerRoundingSettings: timerRoundingSettings,
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
      createdAt: new Date().getTime(),
      memo: null,
    });

    if (!result.success) {
      setErrorMessage(
        result.error
          ? locale === "de-DE"
            ? result.error.german
            : result.error.english
          : locale === "de-DE"
            ? "Timer konnte nicht hinzugefügt werden"
            : "Failed to add timer"
      );
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
        timerRoundingSettings: {
          roundingDirection:
            activeProject.project.rounding_direction ??
            timerRoundingSettings.roundingDirection,
          roundingInterval:
            activeProject.project.rounding_interval ??
            timerRoundingSettings.roundingInterval,
          roundInTimeFragments:
            activeProject.project.round_in_time_fragments ??
            timerRoundingSettings.roundInTimeFragments,
          timeFragmentInterval:
            activeProject.project.time_fragment_interval ??
            timerRoundingSettings.timeFragmentInterval,
        },
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
        createdAt: new Date().getTime(),
        memo: null,
      });

      if (!result.success) {
        setErrorMessage(
          result.error
            ? locale === "de-DE"
              ? result.error.german
              : result.error.english
            : locale === "de-DE"
              ? "Timer konnte nicht hinzugefügt werden"
              : "Failed to add timer"
        );
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
          label={locale === "de-DE" ? "Timer verkleinern" : "Minimize Timer"}
          indicatorLabel="0"
          state={TimerState.Stopped}
          getStatusColor={() => getStatusColor(TimerState.Stopped)}
        />
      </Stack>
    );
  }

  return (
    <Stack align="center" gap="md" mb="md">
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
            {
              roundingDirection:
                activeProject.project.rounding_direction ??
                timerRoundingSettings.roundingDirection,
              roundingInterval:
                activeProject.project.rounding_interval ??
                timerRoundingSettings.roundingInterval,
              roundInTimeFragments:
                activeProject.project.round_in_time_fragments ??
                timerRoundingSettings.roundInTimeFragments,
              timeFragmentInterval:
                activeProject.project.time_fragment_interval ??
                timerRoundingSettings.timeFragmentInterval,
            }
          );
        }}
      />
      <TimeTrackerActionIcon
        action={() => setIsTimeTrackerMinimized(!isTimeTrackerMinimized)}
        label={
          isTimeTrackerMinimized
            ? locale === "de-DE"
              ? "Timer vergrößern"
              : "Expand Timer"
            : locale === "de-DE"
              ? "Timer verkleinern"
              : "Minimize Timer"
        }
        indicatorLabel={activeTimerCount.toString()}
        state={mainTimerStatus}
        getStatusColor={() => getStatusColor(mainTimerStatus)}
      />

      {errorMessage && (
        <Alert
          color="red"
          variant="filled"
          title={locale === "de-DE" ? "Fehler" : "Error"}
          withCloseButton
          onClose={() => setErrorMessage(null)}
        >
          <Text>{errorMessage}</Text>
        </Alert>
      )}
      {timers
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((timer) => (
          <TimeTrackerInstance
            key={timer.id}
            timer={timer}
            isBig={isBig}
            isTimeTrackerMinimized={isTimeTrackerMinimized}
            setIsTimeTrackerMinimized={setIsTimeTrackerMinimized}
            forceEndTimer={timer.forceEndTimer}
          />
        ))}
    </Stack>
  );
}
