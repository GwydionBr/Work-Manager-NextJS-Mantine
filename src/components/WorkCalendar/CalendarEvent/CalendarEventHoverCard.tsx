import { CalendarSession } from "@/types/workCalendar.types";
import { alpha, Card, Stack, Text } from "@mantine/core";
import { formatTime } from "@/utils/workHelperFunctions";

interface CalendarEventHoverCardProps {
  s: CalendarSession;
  color: string;
}

export default function CalendarEventHoverCard({
  s,
  color,
}: CalendarEventHoverCardProps) {
  return (
    <Card withBorder bg={alpha(color, 0.15)} style={{ borderColor: color }}>
      <Stack>
        <Text>{s.projectTitle}</Text>
        <Text>{s.memo}</Text>
        <Text>{formatTime(s.active_seconds)}</Text>
      </Stack>
    </Card>
  );
}
