"use client";


import { alpha, Card, Stack, Text } from "@mantine/core";


import { CalendarSession, ViewMode } from "@/types/workCalendar.types";
import { formatTime, formatTimeSpan, secondsToTimerFormat } from "@/utils/workHelperFunctions";

interface CalendarEventProps {
  s: CalendarSession;
  toY: (date: Date) => number;
  color: string;
  handleSessionClick: (sessionId: string) => void;
}

export default function CalendarEvent({
  s,
  color,
  toY,
  handleSessionClick,
}: CalendarEventProps) {
  const start = new Date(s.start_time);
  const end = new Date(s.end_time);
  const top = toY(start);
  const bottom = toY(end);
  const height = bottom - top;

  return (
    <Card
      p={0}
      radius="sm"
      withBorder
      w="100%"
      h={Math.max(height, 4)}
      bg="var(--mantine-color-body)"
      style={{
        position: "absolute",
        left: 0,
        top: top,
        cursor: "pointer",
        border: `1px solid ${color}`,
        borderLeft: `6px solid ${color}`,
      }}
      onClick={() => handleSessionClick(s.id)}
    >
      <Stack h="100%" pl={6} pt={4} gap={0}>
        <Text size="xs">{formatTime(s.active_seconds)}</Text>
        {s.memo && (
          <Text size="xs" c="dimmed">
            {s.memo}
          </Text>
        )}
        <Text
          maw="100%"
          size="xs"
          fw={600}
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {s.projectTitle}
        </Text>
      </Stack>
    </Card>
  );
}
