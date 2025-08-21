"use client";

import { useSettingsStore } from "@/stores/settingsStore";

import { CalendarSession } from "@/types/workCalendar.types";
import { alpha, Card, Stack, Text } from "@mantine/core";
import { formatTime, formatTimeSpan } from "@/utils/workHelperFunctions";

interface CalendarEventHoverCardProps {
  s: CalendarSession;
  color: string;
}

export default function CalendarEventHoverCard({
  s,
  color,
}: CalendarEventHoverCardProps) {
  const { locale } = useSettingsStore();
  return (
    <Card
      withBorder
      bg={alpha(color, 0.15)}
      style={{ borderColor: color, borderTop: `6px solid ${color}` }}
      miw={175}
    >
      <Card.Section style={{ borderBottom: `1px solid ${color}` }}>
        <Text size="md" fw={600} ta="center">
          {s.projectTitle}
        </Text>
      </Card.Section>
      <Stack pt="xs" gap="xs">
        <Text ta="center" size="xs" fw={500}>
          {formatTimeSpan(new Date(s.start_time), new Date(s.end_time), locale)}
        </Text>
        <Text ta="center" size="xs" fw={500}>
          {formatTime(s.active_seconds)}
        </Text>
        <Text ta="center" size="xs" fw={500}>
          {s.memo}
        </Text>
      </Stack>
    </Card>
  );
}
