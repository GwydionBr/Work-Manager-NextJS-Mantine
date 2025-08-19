import { CalendarSession } from "@/types/workCalendar.types";
import { Stack, Text } from "@mantine/core";
import { formatTime } from "@/utils/workHelperFunctions";

interface CalendarEventHoverCardProps {
  s: CalendarSession;
}

export default function CalendarEventHoverCard({ s }: CalendarEventHoverCardProps) {
  return (
    <Stack>
      <Text>
        {s.projectTitle}
      </Text>
      <Text>
        {s.memo}
      </Text>
      <Text>
        {formatTime(s.active_seconds)}
      </Text>
    </Stack>  
  );
}