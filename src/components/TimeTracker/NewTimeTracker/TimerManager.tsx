"use client";

import { useTimeTrackerManager } from "@/stores/timeTrackerManagerStore";
import { useWorkStore } from "@/stores/workManagerStore";

import { Stack } from "@mantine/core";
import { TimerState } from "@/stores/timeTrackerStore";
import NewTimeTrackerInstance from "./NewTimeTrackerInstance";
import PlusActionIcon from "@/components/UI/ActionIcons/PlusActionIcon";
import { Currency } from "@/types/settings.types";

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
  const { getAllTimers, addTimer } = useTimeTrackerManager();
  const { activeProjectId } = useWorkStore();
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
    addTimer({
      projectId: projectId,
      projectTitle: projectTitle,
      currency: currency,
      salary: salary,
      hourlyPayment: hourlyPayment,
      userId: userId,
      roundingInterval: 60,
      roundingMode: "up",
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
  };

  return (
    <Stack align="center" gap="md">
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
