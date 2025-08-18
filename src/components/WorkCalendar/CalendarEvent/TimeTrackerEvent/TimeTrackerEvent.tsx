"use client";

import { useTimeTrackerManager } from "@/stores/timeTrackerManagerStore";
import { alpha, Stack, Text } from "@mantine/core";
import { isYesterday } from "date-fns";
import ActiveTimeTracker from "./ActiveTimeTracker";

interface TimeTrackerEventProps {
  toY: (date: Date) => number;
  currentTime?: Date;
  day: Date;
}

export default function TimeTrackerEvent({
  toY,
  currentTime,
  day,
}: TimeTrackerEventProps) {
  const { isTimerRunning, getRunningTimer } = useTimeTrackerManager();
  const timer = getRunningTimer();

  const color = "var(--mantine-color-red-6)";
  const backgroundColor = alpha(color, 0.10);

  if (!currentTime) {
    if (isYesterday(day) && isTimerRunning && timer) {
      // Check if the running timer started yesterday
      const timerStartDate = new Date(timer.startTime ?? 0);
      if (isYesterday(timerStartDate)) {
        // Timer started yesterday, show it from start time to end of day
        const top = toY(timerStartDate);
        const endOfDay = new Date(day);
        endOfDay.setHours(23, 59, 59, 999);
        const bottom = toY(endOfDay);
        const height = Math.max(bottom - top, 4);

        return (
          <ActiveTimeTracker
            realHeight={height}
            height={height}
            top={top}
            bottom={bottom}
            timer={timer}
            color={color}
            backgroundColor={backgroundColor}
          />
        );
      }
    }
    return null;
  }

  if (!isTimerRunning || !timer) {
    return (
      <Stack
        gap={1}
        h={20}
        bg="light-dark(var(--mantine-color-white), var(--mantine-color-dark-7))"
        style={{
          position: "absolute",
          top: toY(currentTime),
          left: 0,
          right: 0,
          zIndex: 10,
          borderTop: "2px solid var(--mantine-color-red-6)",
        }}
      >
        <Text size="xs" c="red" ta="center" fw={600}>
          {currentTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </Stack>
    );
  }

  const top = toY(new Date(timer.startTime ?? 0));
  const bottom = toY(currentTime);
  const realHeight = bottom - top;
  const height = Math.max(realHeight, 20);

  return (
    <ActiveTimeTracker
      realHeight={realHeight}
      height={height}
      top={top}
      bottom={bottom}
      timer={timer}
      color={color}
      backgroundColor={backgroundColor}
    />
  );
}
