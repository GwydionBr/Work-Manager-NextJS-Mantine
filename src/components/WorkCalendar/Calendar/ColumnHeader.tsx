import { Stack, Text } from "@mantine/core";

interface ColumnHeaderProps {
  day?: Date;
}

export default function ColumnHeader({ day }: ColumnHeaderProps) {
  return (
    <Stack
      pb="xs"
      align="center"

    >
      <Text fw={600}>
        {day?.toLocaleDateString("en-US", {
          weekday: "short",
          day: "2-digit",
          month: "short",
        })}
      </Text>
    </Stack>
  );
}
