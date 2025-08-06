"use client";

import { useEffect, useState } from "react";
import { useTimeTracker } from "@/hooks/useTimeTracker";
import { useTimeTrackerManager } from "@/stores/timeTrackerManagerStore";
import { Button } from "@mantine/core";

interface TimerInstanceProps {
  timerId: string;
}

export default function TimerInstance({ timerId }: TimerInstanceProps) {
  const [isClient, setIsClient] = useState(false);
  const timer = useTimeTrackerManager((state) => state.getTimer(timerId));
  const updateTimer = useTimeTrackerManager((state) => state.updateTimer);

  if (!timer) return null;

  const {
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
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    cancelTimer,
    restoreTimer,
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
  });

  useEffect(() => {
    setIsClient(true);
    restoreTimer();
  }, []);

  // Sync Hook state mit Store
  useEffect(() => {
    updateTimer(timerId, {
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
    });
  }, [
    state,
    activeTime,
    pausedTime,
    moneyEarned,
    timerId,
    updateTimer,
    activeSeconds,
    pausedSeconds,
    startTime,
    tempStartTime,
    storedActiveSeconds,
    storedPausedSeconds,
  ]);

  if (!isClient) return null;

  return (
    <div>
      <h3>{timer.projectTitle}</h3>
      <div>Active: {activeTime}</div>
      <div>Paused: {pausedTime}</div>
      <div>Earned: {moneyEarned}</div>
      <Button onClick={() => startTimer()}>Start</Button>
      <Button onClick={() => pauseTimer()}>Pause</Button>
      <Button onClick={() => resumeTimer()}>Resume</Button>
      <Button onClick={() => stopTimer()}>Stop</Button>
      <Button onClick={() => cancelTimer()}>Cancel</Button>
    </div>
  );
}
