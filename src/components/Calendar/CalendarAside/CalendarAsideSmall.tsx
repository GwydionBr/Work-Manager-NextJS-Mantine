import { Card, Text } from "@mantine/core";

interface CalendarAsideSmallProps {
  date: Date | null;
}

export default function CalendarAsideSmall({ date }: CalendarAsideSmallProps) {
  return (
    <Card shadow="sm" radius="md" p="md">
      <Text>{date?.toLocaleDateString()}</Text>
    </Card>
  );
}