"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTimeTracker } from "@/hooks/useTimeTracker";
import { useCreateWorkTimeEntryMutation } from "@/utils/queries/work/use-work-time_entry";
import { useWorkProjectQuery } from "@/utils/queries/work/use-work-project";
import { useSettingsStore } from "@/stores/settingsStore";
import {
  useTimeTrackerManager,
  TimerData,
} from "@/stores/timeTrackerManagerStore";

import { alpha, Box, Transition } from "@mantine/core";
import TimeTrackerComponentBig from "./Big/TimeTrackerComponentBig";
import TimeTrackerComponentSmall from "./Small/TimeTrackerComponentSmall";

import { TimerState } from "@/types/timeTracker.types";
import { InsertWorkTimeEntry } from "@/types/work.types";

interface TimeTrackerInstanceProps {
  timer: TimerData;
  isBig: boolean;
  isTimeTrackerMinimized: boolean;
  forceEndTimer: boolean;
  setIsTimeTrackerMinimized: (value: boolean) => void;
}

export default function TimeTrackerInstance({
  timer,
  isBig,
  isTimeTrackerMinimized,
  forceEndTimer,
  setIsTimeTrackerMinimized,
}: TimeTrackerInstanceProps) {
  const [isClient, setIsClient] = useState(false);
  const [memo, setMemo] = useState<string>(timer.memo ?? "");
  const { updateTimer, removeTimer, setForceEndTimer, getAllTimers } =
    useTimeTrackerManager();
  const { data: projects = [] } = useWorkProjectQuery();
  const project = useMemo(
    () => projects.find((p) => p.id === timer.projectId),
    [projects, timer.projectId]
  );
  const {
    mutate: createWorkTimeEntryMutation,
    isPending: isCreatingWorkTimeEntry,
  } = useCreateWorkTimeEntryMutation({
    onSuccess: () => {
      stopTimer();
      setMemo("");
    },
  });
  const {
    timerRoundingSettings: settingsTimerRoundingSettings,
    automaticlyStopOtherTimer,
  } = useSettingsStore();
  const [showSmall, setShowSmall] = useState(true);

  // Funktion zum Beenden aller anderen laufenden Timer
  const stopOtherRunningTimers = useCallback(() => {
    const allTimers = getAllTimers();
    allTimers.forEach((otherTimer) => {
      if (
        otherTimer.id !== timer.id &&
        otherTimer.state === TimerState.Running
      ) {
        setForceEndTimer(otherTimer.id, true);
      }
    });
  }, [timer, getAllTimers, setForceEndTimer]);

  if (!timer) return null;

  const {
    state,
    activeTime,
    pausedTime,
    moneyEarned,
    roundedActiveTime,
    activeSeconds,
    pausedSeconds,
    startTime,
    tempStartTime,
    storedActiveSeconds,
    storedPausedSeconds,
    timerRoundingSettings,
    tempTimerRoundingSettings,
    modifyActiveSeconds,
    modifyPausedSeconds,
    getCurrentSession,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    cancelTimer,
    restoreTimer,
    setTimerRounding,
    setTempTimerRounding,
  } = useTimeTracker({
    projectId: timer.projectId,
    projectTitle: timer.projectTitle,
    currency: timer.currency,
    salary: timer.salary,
    hourlyPayment: timer.hourlyPayment,
    userId: timer.userId,
    timerRoundingSettings: timer.timerRoundingSettings,
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
    memo: timer.memo,
  });

  // Sync Hook state mit Store
  useEffect(() => {
    updateTimer(timer.id, {
      state,
      activeTime,
      pausedTime,
      moneyEarned,
      activeSeconds,
      pausedSeconds,
      startTime,
      tempStartTime,
      storedActiveSeconds,
      storedPausedSeconds,
      memo,
    });
  }, [
    timer.id,
    updateTimer,
    state,
    activeTime,
    pausedTime,
    moneyEarned,
    activeSeconds,
    pausedSeconds,
    startTime,
    tempStartTime,
    storedActiveSeconds,
    storedPausedSeconds,
    memo,
  ]);

  useEffect(() => {
    if (project) {
      const newTimerRoundingSettings = {
        ...timerRoundingSettings,
        roundingDirection:
          project.rounding_direction ??
          settingsTimerRoundingSettings.roundingDirection,
        roundingInterval:
          project.rounding_interval ??
          settingsTimerRoundingSettings.roundingInterval,
        roundInTimeFragments:
          project.round_in_time_fragments ??
          settingsTimerRoundingSettings.roundInTimeFragments,
        timeFragmentInterval:
          project.time_fragment_interval ??
          settingsTimerRoundingSettings.timeFragmentInterval,
      };
      updateTimer(timer.id, {
        projectTitle: project.title,
        timerRoundingSettings: newTimerRoundingSettings,
      });
      setTimerRounding(newTimerRoundingSettings);
    }
  }, [project, settingsTimerRoundingSettings]);

  // Erweiterte startTimer Funktion, die andere Timer beendet
  const startTimerWithStopOthers = useCallback(() => {
    if (automaticlyStopOtherTimer) {
      stopOtherRunningTimers();
    }
    startTimer();
  }, [stopOtherRunningTimers, startTimer, automaticlyStopOtherTimer]);

  // Restore Timer
  useEffect(() => {
    restoreTimer();
    setIsClient(true);
  }, []);

  // Force End Timer
  useEffect(() => {
    if (forceEndTimer) {
      submitTimer();
      setForceEndTimer(timer.id, false);
    }
  }, [forceEndTimer]);

  if (!isClient) return null;

  async function submitTimer() {
    if (isCreatingWorkTimeEntry) return;
    let newSession: InsertWorkTimeEntry = {
      ...getCurrentSession(),
      memo: memo === "" ? null : memo,
    };

    createWorkTimeEntryMutation({
      newTimeEntry: newSession,
      roundingSettings: tempTimerRoundingSettings ?? timerRoundingSettings,
    });
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
              color={project?.color ?? null}
              backgroundColor={
                project?.color
                  ? alpha(project.color, 0.1)
                  : "var(--mantine-color-body)"
              }
              removeTimer={() => removeTimer(timer.id)}
              moneyEarned={moneyEarned}
              currency={timer.currency}
              hourlyPayment={timer.hourlyPayment}
              roundedActiveTime={roundedActiveTime}
              state={state}
              memo={memo}
              activeTime={activeTime}
              pausedTime={pausedTime}
              activeSeconds={activeSeconds}
              timerRoundingSettings={
                tempTimerRoundingSettings ?? timerRoundingSettings
              }
              salary={timer.salary}
              storedActiveSeconds={storedActiveSeconds}
              storedPausedSeconds={storedPausedSeconds}
              startTimer={startTimerWithStopOthers}
              pauseTimer={pauseTimer}
              resumeTimer={resumeTimer}
              cancelTimer={cancelTimer}
              isTimeTrackerMinimized={isTimeTrackerMinimized}
              setIsTimeTrackerMinimized={setIsTimeTrackerMinimized}
              isSubmitting={isCreatingWorkTimeEntry}
              setMemo={setMemo}
              submitTimer={submitTimer}
              modifyActiveSeconds={modifyActiveSeconds}
              modifyPausedSeconds={modifyPausedSeconds}
              setTempTimerRounding={setTempTimerRounding}
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
              color={project?.color ?? null}
              backgroundColor={
                project?.color
                  ? alpha(project.color, 0.1)
                  : "var(--mantine-color-body)"
              }
              roundedActiveTime={roundedActiveTime}
              state={state}
              activeTime={activeTime}
              pausedTime={pausedTime}
              activeSeconds={activeSeconds}
              timerRoundingSettings={
                tempTimerRoundingSettings ?? timerRoundingSettings
              }
              projectTitle={timer.projectTitle}
              salary={timer.salary}
              currency={timer.currency}
              hourlyPayment={timer.hourlyPayment}
              storedActiveSeconds={storedActiveSeconds}
              storedPausedSeconds={storedPausedSeconds}
              modifyActiveSeconds={modifyActiveSeconds}
              modifyPausedSeconds={modifyPausedSeconds}
              setTempTimerRounding={setTempTimerRounding}
              showSmall={showSmall}
              setShowSmall={setShowSmall}
              isSubmitting={isCreatingWorkTimeEntry}
              submitTimer={submitTimer}
              startTimer={startTimerWithStopOthers}
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
