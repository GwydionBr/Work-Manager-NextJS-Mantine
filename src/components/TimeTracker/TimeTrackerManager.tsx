"use client";

import { useEffect, useState } from "react";
import {
  TimerData,
  useTimeTrackerManager,
} from "@/stores/timeTrackerManagerStore";
import { useWorkStore } from "@/stores/workManagerStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Alert, Stack, Text } from "@mantine/core";
import { TimerState } from "@/types/timeTracker.types";
import TimeTrackerInstance from "./TimeTrackerInstance";
import PlusActionIcon from "@/components/UI/ActionIcons/PlusActionIcon";
import TimeTrackerActionIcon from "./TimeTrackerActionIcons/TimeTrackerActionIcon";
import { getStatusColor } from "@/utils/workHelperFunctions";
import { Tables } from "@/types/db.types";

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
  const {
    getAllTimers,
    addTimer,
    timers: timerData,
    updateTimer,
  } = useTimeTrackerManager();
  const { activeProjectId } = useWorkStore();
  const { timerRoundingSettings, locale } = useSettingsStore();
  const activeProject = useWorkStore((state) =>
    state.projects.find((p) => p.id === activeProjectId)
  );
  const [timers, setTimers] = useState<TimerData[]>([]);

  useEffect(() => {
    const allTimers = getAllTimers();
    const newTimers = allTimers.map((timer) => {
      if (timer.timerRoundingSettings === undefined) {
        updateTimer(timer.id, {
          timerRoundingSettings: timerRoundingSettings,
        });
        const newTimer = {
          ...timer,
          timerRoundingSettings: timerRoundingSettings,
        };
        return newTimer;
      }
      return timer;
    });

    setTimers(newTimers);
  }, [timerData, getAllTimers]);

  // Client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddTimer = (project: Tables<"timer_project">) => {
    const result = addTimer(project, timerRoundingSettings);

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
      handleAddTimer(activeProject);
    }
  }, [timers, activeProject]);

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
          handleAddTimer(activeProject);
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
