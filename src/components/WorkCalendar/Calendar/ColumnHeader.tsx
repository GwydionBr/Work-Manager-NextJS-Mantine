"use client";

import { useHover } from "@mantine/hooks";
import { useSettingsStore } from "@/stores/settingsStore";

import { Stack, Text } from "@mantine/core";

interface ColumnHeaderProps {
  day?: Date;
  setReferenceDate?: (date: Date) => void;
  icon?: React.ReactNode;
}

export default function ColumnHeader({
  day,
  setReferenceDate,
  icon,
}: ColumnHeaderProps) {
  const { hovered, ref } = useHover();
  const { locale } = useSettingsStore();
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
        position: "sticky",
        top: 60,
        zIndex: 10,
        cursor: day ? "pointer" : "default",
        border: day
          ? "1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-5))"
          : "none",
        borderBottom: day
          ? "2px solid light-dark(var(--mantine-color-gray-6), var(--mantine-color-dark-2))"
          : "none",
        backgroundColor:
          hovered && day
            ? "light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-5))"
            : "var(--mantine-color-body)",
        borderTopLeftRadius: day ? 6 : 0,
        borderTopRightRadius: day ? 6 : 0,
      }}
    >
      {icon && icon}
      {day && (
        <Text fw={600}>
          {day?.toLocaleDateString(locale, {
            weekday: "short",
            day: "2-digit",
            month: "short",
          })}
        </Text>
      )}
    </Stack>
  );
}
