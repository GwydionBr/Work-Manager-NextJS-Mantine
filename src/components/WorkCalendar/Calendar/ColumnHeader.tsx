import { Stack, Text } from "@mantine/core";

interface ColumnHeaderProps {
  day?: Date;
}

export default function ColumnHeader({ day }: ColumnHeaderProps) {
  return (
    <Stack
      style={{
        position: "sticky",
        top: 60,
        zIndex: 10,
        background: "var(--mantine-color-body)",
        borderBottom:
          "1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-gray-6))",
      }}
    >
      <Text>
        {day?.toLocaleDateString("en-US", {
          weekday: "short",
          day: "2-digit",
          month: "short",
        })}
      </Text>
    </Stack>
  );
}
