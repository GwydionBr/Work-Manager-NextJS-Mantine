import { ActionIcon, Card } from "@mantine/core";
import { IconCalendarWeek } from "@tabler/icons-react";

interface CalendarAsideSmallProps {
  date: Date | null;
}

export default function CalendarAsideSmall({ date }: CalendarAsideSmallProps) {
  return (
    <Card shadow="sm" radius="md" p="md">
      <ActionIcon
        variant="transparent"
        aria-label="Toggle Small Calendar"
        onClick={() => {}}
        size="md"
      >
        <IconCalendarWeek />
      </ActionIcon>
    </Card>
  );
}
