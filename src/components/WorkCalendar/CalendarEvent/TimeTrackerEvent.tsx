"use client";

import { useTimeTrackerManager } from "@/stores/timeTrackerManagerStore";
import { TimerState } from "@/stores/timeTrackerStore";
import { Stack, Box, Text, Group, Indicator } from "@mantine/core";

interface TimeTrackerEventProps {
  toY: (date: Date) => number;
  currentTime: Date;
  color: string;
}

export default function TimeTrackerEvent({
  toY,
  currentTime,
  color,
}: TimeTrackerEventProps) {
  const { isTimerRunning, getRunningTimer } = useTimeTrackerManager();
  const timer = getRunningTimer();

  if (!isTimerRunning || !timer) {
    return (
      <Stack
        gap={1}
        style={{
          position: "absolute",
          top: toY(currentTime),
          left: 0,
          right: 0,
          height: 2,
          background: "var(--mantine-color-red-6)",
          zIndex: 10,
        }}
      >
        <Box w="100%" h={2} bg={"var(--mantine-color-red-6)"} style={{ zIndex: 11 }} />
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
  const height = Math.max(realHeight, 4);

  return (
    <Box>
      <Box
        h={Math.max(height, 20)}
        w="100%"
        style={{
          position: "absolute",
          top: bottom - Math.max(height, 18),
          left: 0,
          right: 0,
          zIndex: 10,
          background:
            "light-dark(var(--mantine-color-white), var(--mantine-color-dark-9))",
        }}
      >
        <Stack
          h={Math.max(height, 20)}
          w="100%"
          gap={0}
          p={0}
          justify="space-between"
          style={{ border: "1px solid red", borderBottom: "2px solid red" }}
        >
          <Group justify="center" align="center" px="xs">
            <Indicator
              size={10}
              color={"var(--mantine-color-red-6)"}
              processing={timer.state === TimerState.Running}
            />
            <Text size="xs" ta="center" fw={600}>
              {timer.activeTime}
            </Text>
          </Group>
        </Stack>
      </Box>
      <Box
        style={{
          position: "absolute",
          visibility: realHeight > 2 ? "visible" : "hidden",
          left: 0,
          top: top,
          width: 10,
          height,
          background: "var(--mantine-color-red-6)",
          border: `1px solid light-dark(var(--mantine-color-gray-9), var(--mantine-color-gray-0))`,
          zIndex: 10,
        }}
      />
    </Box>
  );
}
