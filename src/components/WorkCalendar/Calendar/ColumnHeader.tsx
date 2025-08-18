"use client";

import { useHover } from "@mantine/hooks";

import { Stack, Text } from "@mantine/core";

interface ColumnHeaderProps {
  day?: Date;
  setReferenceDate?: (date: Date) => void;
}

export default function ColumnHeader({
  day,
  setReferenceDate,
}: ColumnHeaderProps) {
  const { hovered, ref } = useHover();
  return (
    <Stack
      p={5}
      align="center"
      onClick={() => {
        if (setReferenceDate && day) {
          setReferenceDate(day);
        }
      }}
      ref={ref}
      style={{
        cursor: day ? "pointer" : "default",
        border: day ? "1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-5))" : "none",
        backgroundColor: hovered && day ? "light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-5))" : "transparent",
        borderRadius: 6,
      }}
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
