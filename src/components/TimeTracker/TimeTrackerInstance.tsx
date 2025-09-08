"use client";

import { useState, useEffect, useCallback } from "react";
import { useTimeTracker } from "@/hooks/useTimeTracker";
import { useWorkStore } from "@/stores/workManagerStore";
import { useSettingsStore } from "@/stores/settingsStore";
import {
  useTimeTrackerManager,
  TimerData,
} from "@/stores/timeTrackerManagerStore";

import { alpha, Box, Transition } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import TimeTrackerComponentBig from "./Big/TimeTrackerComponentBig";
import TimeTrackerComponentSmall from "./Small/TimeTrackerComponentSmall";

import { getTimeFragmentSession } from "@/utils/helper/getTimeFragmentSession";
import { formatTimeSpan } from "@/utils/formatFunctions";

import { TimerState } from "@/types/timeTracker.types";
import { TablesInsert } from "@/types/db.types";

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
  const { addTimerSession, projects } =
    useWorkStore();
  const {
    timeFragmentInterval,
    roundInTimeFragments,
    automaticlyStopOtherTimer,
    locale,
  } = useSettingsStore();
  const [showSmall, setShowSmall] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const project = projects.find((p) => p.project.id === timer.projectId);

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
    roundingMode,
    roundingInterval,
    modifyActiveSeconds,
    modifyPausedSeconds,
    getCurrentSession,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    cancelTimer,
    restoreTimer,
    setRoundingAmount,
    setRoundInTimeSections,
  } = useTimeTracker({
    projectId: timer.projectId,
    projectTitle: timer.projectTitle,
    currency: timer.currency,
    salary: timer.salary,
    hourlyPayment: timer.hourlyPayment,
    userId: timer.userId,
    roundingInterval: timer.roundingInterval,
    roundingMode: timer.roundingMode,
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
    timeSectionInterval: timeFragmentInterval,
    roundInTimeSections: roundInTimeFragments,
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
      projectTitle: project?.project.title ?? timer.projectTitle,
    });
  }, [
    project,
    state,
    activeTime,
    pausedTime,
    moneyEarned,
    timer.id,
    updateTimer,
    activeSeconds,
    pausedSeconds,
    startTime,
    tempStartTime,
    storedActiveSeconds,
    storedPausedSeconds,
    memo,
  ]);

  // Erweiterte startTimer Funktion, die andere Timer beendet
  const startTimerWithStopOthers = useCallback(() => {
    if (automaticlyStopOtherTimer) {
      stopOtherRunningTimers();
    }
    startTimer();
  }, [stopOtherRunningTimers, startTimer, automaticlyStopOtherTimer]);

  useEffect(() => {
    restoreTimer();
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (forceEndTimer) {
      submitTimer();
      setForceEndTimer(timer.id, false);
    }
  }, [forceEndTimer]);

  useEffect(() => {
    setRoundInTimeSections(roundInTimeFragments, timeFragmentInterval);
  }, [roundInTimeFragments, timeFragmentInterval, setRoundInTimeSections]);

  if (!isClient) return null;

  async function submitTimer() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    let newSession: TablesInsert<"timer_session"> = {
      ...getCurrentSession(),
      memo: memo === "" ? null : memo,
    };
    if (roundInTimeFragments) {
      newSession = getTimeFragmentSession(timeFragmentInterval, newSession);
    }

    const { createdSession, collisionFragments, completeOverlap } =
      await addTimerSession(newSession);

    if (completeOverlap) {
      notifications.show({
        title:
          locale === "de-DE" ? "Komplette Überschneidung" : "Complete overlap",
        message:
          locale === "de-DE"
            ? "Timer Sitzung überschneided sich komplett mit bereits bestehenden Sitzungen und wurde daher nicht gespeichert."
            : "Timer session completely overlaps with another session and was not saved.",
        color: "red",
        autoClose: false,
      });
      stopTimer();
    } else if (createdSession) {
      if (collisionFragments) {
        notifications.show({
          title:
            locale === "de-DE" ? "Überschneidung Erkannnt" : "Overlap detected",
          message:
            locale === "de-DE"
              ? `Timer Sitzung hat Überschneidungen und wurde angepasst.\n 
          Überschneidungen: ${collisionFragments
            .map((fragment) =>
              formatTimeSpan(
                new Date(fragment.start_time),
                new Date(fragment.end_time),
                locale
              )
            )
            .join(", ")}\n
            Erstellte Sitzung: ${formatTimeSpan(
              new Date(createdSession.start_time),
              new Date(createdSession.end_time),
              locale
            )}`
              : `Timer session overlaps with another session and got adjusted.\n
            Overlaps: ${collisionFragments
              .map((fragment) =>
                formatTimeSpan(
                  new Date(fragment.start_time),
                  new Date(fragment.end_time),
                  locale
                )
              )
              .join(", ")}\n
            Created session: ${formatTimeSpan(
              new Date(createdSession.start_time),
              new Date(createdSession.end_time),
              locale
            )}`,
          color: "yellow",
          autoClose: false,
        });
      }
      setMemo("");
      stopTimer();
    } else {
      notifications.show({
        title: locale === "de-DE" ? "Fehler" : "Error",
        message:
          locale === "de-DE"
            ? "Fehler beim Speichern der Sitzung. Bitte versuche es erneut."
            : "Error saving session. Please try again.",
        color: "red",
        autoClose: 6000,
      });
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
              projectTitle={timer.projectTitle}
              color={project?.project.color ?? null}
              backgroundColor={
                project?.project.color
                  ? alpha(project.project.color, 0.1)
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
              roundingMode={roundingMode}
              roundingInterval={roundingInterval}
              salary={timer.salary}
              storedActiveSeconds={storedActiveSeconds}
              storedPausedSeconds={storedPausedSeconds}
              startTimer={startTimerWithStopOthers}
              pauseTimer={pauseTimer}
              resumeTimer={resumeTimer}
              cancelTimer={cancelTimer}
              isTimeTrackerMinimized={isTimeTrackerMinimized}
              setIsTimeTrackerMinimized={setIsTimeTrackerMinimized}
              isSubmitting={isSubmitting}
              setMemo={setMemo}
              submitTimer={submitTimer}
              modifyActiveSeconds={modifyActiveSeconds}
              modifyPausedSeconds={modifyPausedSeconds}
              setRoundingAmount={setRoundingAmount}
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
              color={project?.project.color ?? null}
              backgroundColor={
                project?.project.color
                  ? alpha(project.project.color, 0.1)
                  : "var(--mantine-color-body)"
              }
              roundedActiveTime={roundedActiveTime}
              state={state}
              activeTime={activeTime}
              pausedTime={pausedTime}
              activeSeconds={activeSeconds}
              roundingMode={roundingMode}
              roundingInterval={roundingInterval}
              projectTitle={timer.projectTitle}
              salary={timer.salary}
              currency={timer.currency}
              hourlyPayment={timer.hourlyPayment}
              storedActiveSeconds={storedActiveSeconds}
              storedPausedSeconds={storedPausedSeconds}
              modifyActiveSeconds={modifyActiveSeconds}
              modifyPausedSeconds={modifyPausedSeconds}
              setRoundingAmount={setRoundingAmount}
              showSmall={showSmall}
              setShowSmall={setShowSmall}
              isSubmitting={isSubmitting}
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
