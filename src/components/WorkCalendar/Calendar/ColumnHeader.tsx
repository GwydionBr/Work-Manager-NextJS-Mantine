"use client";

import { useHover } from "@mantine/hooks";
import { useSettingsStore } from "@/stores/settingsStore";

import { Box, Card, Group, HoverCard, Stack, Text } from "@mantine/core";
import { CalendarDay, VisibleProject } from "@/types/workCalendar.types";
import { formatDate, formatMoney, formatTime } from "@/utils/formatFunctions";
import { useMemo } from "react";
import { calculateSessionTimeForDay } from "../calendarUtils";

interface ColumnHeaderProps {
  day?: CalendarDay;
  setReferenceDate?: (date: Date) => void;
  icon?: React.ReactNode;
  visibleProjects: VisibleProject[];
}

export default function ColumnHeader({
  day,
  setReferenceDate,
  icon,
  visibleProjects,
}: ColumnHeaderProps) {
  const { hovered, ref } = useHover();
  const { locale } = useSettingsStore();
  const totalTime = useMemo(() => {
    if (!day) return 0;
    return day.sessions.reduce(
      (acc, session) => acc + calculateSessionTimeForDay(session, day.day),
      0
    );
  }, [day]);

  return (
    <HoverCard
      openDelay={300}
      closeDelay={100}
      disabled={!day || visibleProjects.length === 0 || totalTime === 0}
      position="bottom"
    >
      <HoverCard.Target>
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
                {formatDate(day.day, locale)}
              </Text>
              <Text size="xs" c="dimmed" fw={500} ta="center">
                {formatTime(totalTime)}
              </Text>
            </Stack>
          )}
        </Stack>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Stack gap={4}>
          {visibleProjects.map((p) => {
            const totalTime =
              day?.sessions.reduce(
                (acc, session) =>
                  session.project_id === p.id
                    ? acc + calculateSessionTimeForDay(session, day.day)
                    : acc,
                0
              ) ?? 0;
            const earnings = (p.salary * totalTime) / 3600;

            if (totalTime === 0) return null;
            return (
              <Card withBorder key={p.id}>
                <Group>
                  <Box w={10} h={10} bg={p.color} style={{ borderRadius: 5 }} />
                  <Stack gap={4}>
                    <Text size="sm" fw={500}>
                      {p.title}
                    </Text>
                    <Text size="xs" c="dimmed" fw={500}>
                      {formatTime(totalTime)}
                    </Text>
                    {earnings > 0 && (
                      <Text size="xs" c="dimmed" fw={500}>
                        {formatMoney(earnings, p.currency, locale)}
                      </Text>
                    )}
                  </Stack>
                </Group>
              </Card>
            );
          })}
        </Stack>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
