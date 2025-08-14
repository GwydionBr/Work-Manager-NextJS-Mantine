"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Group,
  Paper,
  ScrollArea,
  SegmentedControl,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { Tables } from "@/types/db.types";
import { formatDate } from "@/utils/workHelperFunctions";

type ViewMode = "day" | "week";

interface WorkCalendarProps {
  sessions: Tables<"timer_session">[];
}

function getStartOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function WorkCalendar({ sessions }: WorkCalendarProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());

  const days: Date[] = useMemo(() => {
    if (viewMode === "day") return [getStartOfDay(referenceDate)];
    const startOfWeek = (() => {
      const d = getStartOfDay(referenceDate);
      // ISO week: Monday start
      const day = (d.getDay() + 6) % 7; // 0..6, 0 = Monday
      d.setDate(d.getDate() - day);
      return d;
    })();
    return Array.from({ length: 7 }, (_, i) => addDays(startOfWeek, i));
  }, [viewMode, referenceDate]);

  const sessionsByDay = useMemo(() => {
    const map = new Map<string, Tables<"timer_session">[]>();
    days.forEach((d) => {
      map.set(d.toISOString().slice(0, 10), []);
    });
    sessions.forEach((s) => {
      const start = new Date(s.start_time);
      const end = new Date(s.end_time);
      // include session if any overlap with current range days
      days.forEach((d) => {
        const dayStart = getStartOfDay(d);
        const dayEnd = addDays(dayStart, 1);
        const overlaps = start < dayEnd && end > dayStart;
        if (overlaps) {
          const key = dayStart.toISOString().slice(0, 10);
          map.get(key)?.push(s);
        }
      });
    });
    return map;
  }, [sessions, days]);

  const hourHeight = 60; // px per hour
  const timelineStartHour = 0;
  const timelineEndHour = 24;

  const toY = (date: Date) => {
    const minutes = date.getHours() * 60 + date.getMinutes();
    const totalMinutes = (timelineEndHour - timelineStartHour) * 60;
    const y = (minutes / totalMinutes) * (totalMinutes / 60) * hourHeight;
    return clamp(y, 0, (timelineEndHour - timelineStartHour) * hourHeight);
  };

  const dayColumn = (day: Date) => {
    const key = getStartOfDay(day).toISOString().slice(0, 10);
    const items = sessionsByDay.get(key) ?? [];

    return (
      <Box key={key} style={{ flex: 1, minWidth: 220 }}>
        <Stack gap="xs">
          <Text fw={600}>{formatDate(day)}</Text>
          <Box
            style={{
              position: "relative",
              height: hourHeight * (timelineEndHour - timelineStartHour),
              border: "1px solid var(--mantine-color-gray-3)",
              borderRadius: 8,
              background: "var(--mantine-color-gray-0)",
            }}
          >
            {Array.from(
              { length: timelineEndHour - timelineStartHour + 1 },
              (_, i) => (
                <Box
                  key={i}
                  style={{
                    position: "absolute",
                    top: i * hourHeight,
                    left: 0,
                    right: 0,
                    height: 1,
                    background: "var(--mantine-color-gray-3)",
                  }}
                />
              )
            )}
            {items.map((s) => {
              const sStart = new Date(s.start_time);
              const sEnd = new Date(s.end_time);
              const dayStart = getStartOfDay(day);
              const dayEnd = addDays(dayStart, 1);
              const start = sStart < dayStart ? dayStart : sStart;
              const end = sEnd > dayEnd ? dayEnd : sEnd;
              const top = toY(start);
              const bottom = toY(end);
              const height = Math.max(bottom - top, 4);
              return (
                <Tooltip
                  key={s.id}
                  label={`${new Date(s.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${new Date(s.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                >
                  <Box
                    style={{
                      position: "absolute",
                      left: 8,
                      right: 8,
                      top,
                      height,
                      borderRadius: 6,
                      background: "var(--mantine-color-blue-3)",
                      boxShadow: "inset 0 0 0 1px var(--mantine-color-blue-6)",
                    }}
                  />
                </Tooltip>
              );
            })}
          </Box>
        </Stack>
      </Box>
    );
  };

  return (
    <Paper withBorder radius="lg" p="md">
      <Stack>
        <Group justify="space-between">
          <SegmentedControl
            value={viewMode}
            onChange={(v) => setViewMode(v as ViewMode)}
            data={[
              { label: "Tag", value: "day" },
              { label: "Woche", value: "week" },
            ]}
          />
          <Group gap="xs">
            <Text
              style={{ cursor: "pointer" }}
              onClick={() =>
                setReferenceDate(
                  addDays(referenceDate, viewMode === "day" ? -1 : -7)
                )
              }
            >
              {"<"}
            </Text>
            <Text>{formatDate(referenceDate)}</Text>
            <Text
              style={{ cursor: "pointer" }}
              onClick={() =>
                setReferenceDate(
                  addDays(referenceDate, viewMode === "day" ? 1 : 7)
                )
              }
            >
              {">"}
            </Text>
          </Group>
        </Group>

        <ScrollArea
          h={hourHeight * (timelineEndHour - timelineStartHour) + 120}
          offsetScrollbars
        >
          <Group align="flex-start" wrap="nowrap">
            {days.map((d) => dayColumn(d))}
          </Group>
        </ScrollArea>
      </Stack>
    </Paper>
  );
}
