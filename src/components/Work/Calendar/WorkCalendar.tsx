"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useWorkStore } from "@/stores/workManagerStore";
import { useViewportSize } from "@mantine/hooks";

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
import {
  areEarningsBreakdownEmpty,
  formatEarnings,
} from "@/utils/sessionHelperFunctions";
import { EarningsBreakdown } from "@/types/timerSession.types";

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

function renderEarnings(earnings: EarningsBreakdown) {
  return (
    <Group gap="xs">
      {!areEarningsBreakdownEmpty(earnings) && (
        <Group gap="xs">
          {earnings.unpaid.some((e) => e.amount > 0) && (
            <Text size="sm" c="red">
              {formatEarnings(earnings.unpaid)} unpaid
            </Text>
          )}
          {earnings.paid.some((e) => e.amount > 0) && (
            <Text size="sm" c="dimmed">
              {formatEarnings(earnings.paid)} paid
            </Text>
          )}
        </Group>
      )}
    </Group>
  );
} 

export default function WorkCalendar({ sessions }: WorkCalendarProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());
  const { projects: timerProjects } = useWorkStore();
  const projects = timerProjects.map((project) => project.project);
  const firstHeaderRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const { height: viewportHeight } = useViewportSize();

  function getEarnedSalary(
    sessions: Tables<"timer_session">[],
    unpaid: boolean
  ) {
    return sessions.reduce((sum, s) => {
      const project = projects.find((p) => p.id === s.project_id);
      if (project && project.hourly_payment && (unpaid ? !s.payed : s.payed)) {
        return sum + (project.salary * s.active_seconds) / 3600;
      }
      return sum;
    }, 0);
  }

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

  useEffect(() => {
    if (firstHeaderRef.current) {
      const rect = firstHeaderRef.current.getBoundingClientRect();
      setHeaderHeight(rect.height);
    }
  }, [viewMode, referenceDate]);

  const timeColumn = () => {
    return (
      <Box style={{ width: 56 }}>
        <Stack gap="xs">
          <Box style={{ height: headerHeight }} />
          <Box
            style={{
              position: "relative",
              height: hourHeight * (timelineEndHour - timelineStartHour),
            }}
          >
            {Array.from(
              { length: timelineEndHour - timelineStartHour + 1 },
              (_, i) => (
                <Text
                  key={i}
                  size="xs"
                  c="dimmed"
                  style={{
                    position: "absolute",
                    top: i * hourHeight - 5,
                    left: 0,
                    width: "100%",
                    textAlign: "right",
                    paddingRight: 8,
                  }}
                >
                  {String(i + timelineStartHour).padStart(2, "0")}:00
                </Text>
              )
            )}
          </Box>
        </Stack>
      </Box>
    );
  };

  const dayColumn = (day: Date, isFirst: boolean) => {
    const key = getStartOfDay(day).toISOString().slice(0, 10);
    const items = sessionsByDay.get(key) ?? [];

    return (
      <Box key={key} style={{ flex: 1 }}>
        <Stack gap="xs">
          <Stack align="center" ref={isFirst ? firstHeaderRef : undefined}>
            <Text fw={600}>{formatDate(day)}</Text>
            {/* <Group>
              <Text>{getEarnedSalary(items, true)}</Text>
              <Text>{getEarnedSalary(items, false)}</Text>
            </Group> */}
          </Stack>
          <Box
            style={{
              position: "relative",
              height: hourHeight * (timelineEndHour - timelineStartHour),
              border: "1px solid var(--mantine-color-gray-3)",
              borderRadius: 0,
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
          h={viewportHeight - 225}
          offsetScrollbars
        >
          <Group align="flex-start" wrap="nowrap" gap={0}>
            {timeColumn()}
            {days.map((d, idx) => dayColumn(d, idx === 0))}
          </Group>
        </ScrollArea>
      </Stack>
    </Paper>
  );
}
