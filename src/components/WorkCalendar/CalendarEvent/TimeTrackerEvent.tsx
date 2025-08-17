"use client";

import { useTimeTrackerManager } from "@/stores/timeTrackerManagerStore";
import { Stack, Box, Text, Group } from "@mantine/core";

interface TimeTrackerEventProps {
  toY: (date: Date) => number;
  currentTime: Date;
  color: string;
  visibleProjects: {
    id: string;
    title: string;
    colors: {
      rail: string;
      border: string;
      fill: string;
    };
  }[];
}

export default function TimeTrackerEvent({
  toY,
  currentTime,
  visibleProjects,
}: TimeTrackerEventProps) {
  const { isTimerRunning, getRunningTimer } = useTimeTrackerManager();
  const timer = getRunningTimer();

  const color = visibleProjects.find((p) => p.id === String(timer?.projectId))
    ?.colors.rail;

  const redLine = <Box w="100%" h={2} bg={color} />;

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
          background: color ? color : "var(--mantine-color-red-6)",
          zIndex: 10,
        }}
      >
        {redLine}
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
  const height = Math.max(bottom - top, 4);

  return (
    <Box>
      <Stack
        w="100%"
        gap={1}
        style={{
          position: "absolute",
          top: top,
          left: 0,
          right: 0,
          zIndex: 10,
          background:
            "light-dark(var(--mantine-color-white), var(--mantine-color-dark-9))",
        }}
      >
        <Group justify="space-between" align="center" px="xs">
          <Text size="xs" c={color ? color : "red"} ta="center" fw={600}>
            {timer.activeTime}
          </Text>
        </Group>
        {redLine}
      </Stack>
      <Box
        style={{
          position: "absolute",
          left: 0,
          top,
          width: 10,
          height,
          borderRadius: 5,
          background: "var(--mantine-color-red-6)",
          border: `1px solid light-dark(var(--mantine-color-gray-9), var(--mantine-color-gray-0))`,
          zIndex: 20,
        }}
      />
    </Box>
  );
}
