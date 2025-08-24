"use client";

import { useHover } from "@mantine/hooks";
import { useSettingsStore } from "@/stores/settingsStore";

import { Stack, Text } from "@mantine/core";
import { CalendarDay } from "@/types/workCalendar.types";
import { formatTime } from "@/utils/workHelperFunctions";

interface ColumnHeaderProps {
  day?: CalendarDay;
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
      h="100%"
      align="center"
      onClick={() => {
        if (setReferenceDate && day) {
          setReferenceDate(day.day);
        }
      }}
      ref={ref}
      style={{
        position: "sticky",
        top: 60,
        zIndex: 20,
        cursor: day ? "pointer" : "default",
        border: day
          ? "1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-5))"
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
        <Stack gap={4}>
          <Text fw={600}>
            {day.day.toLocaleDateString(locale, {
              weekday: "short",
              day: "2-digit",
              month: "short",
            })}
          </Text>
          <Text
            size="xs"
            c="light-dark(var(--mantine-color-gray-6), var(--mantine-color-dark-2))"
          >
            Total:{" "}
            {formatTime(
              day.sessions.reduce(
                (acc, session) => acc + session.active_seconds,
                0
              )
            )}
          </Text>
        </Stack>
      )}
    </Stack>
  );
}
