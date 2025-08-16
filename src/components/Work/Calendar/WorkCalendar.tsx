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
} from "@mantine/core";
import { Tables } from "@/types/db.types";
import { formatDate } from "@/utils/workHelperFunctions";
import { DayColumn } from "./DayColumn";
import { TimeColumn } from "./TimeColumn";
import {
  addDays,
  clamp,
  getStartOfDay,
  CalendarSession,
  getProjectColor,
} from "./calendarUtils";

type ViewMode = "day" | "week";

export default function WorkCalendar() {
  // Controls whether we show a single day or a full week
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  // Anchor date (day or week) the calendar is based on
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());
  const { projects: timerProjects, timerSessions } = useWorkStore();
  const projects = timerProjects.map((project) => project.project);
  // Measuring first header and first column allows aligning the sticky header
  // and computing available space for bubble lanes
  const firstHeaderRef = useRef<HTMLDivElement | null>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const { height: viewportHeight } = useViewportSize();
  const firstColumnContainerRef = useRef<HTMLDivElement | null>(null);
  const [columnWidth, setColumnWidth] = useState<number>(0);

  function getEarnedSalary(
    sessions: Tables<"timer_session">[],
    unpaid: boolean
  ) {
    // Sum the salary only for sessions that are paid/unpaid according to the flag
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
    // Bucket raw sessions by day key so we can render a column per day
    const map = new Map<string, Tables<"timer_session">[]>();
    days.forEach((d) => {
      map.set(d.toISOString().slice(0, 10), []);
    });
    timerSessions.forEach((s) => {
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
  }, [timerSessions, days]);

  // Projects visible in the current view (based on sessions overlapping the visible days)
  const visibleProjects = useMemo(() => {
    const ids = new Set<string>();
    sessionsByDay.forEach((items) => {
      items.forEach((s) => ids.add(String(s.project_id)));
    });
    return Array.from(ids)
      .map((id) => {
        const p = projects.find((pp) => pp.id === id);
        if (!p) return null;
        return { id, title: p.title, colors: getProjectColor(id) };
      })
      .filter(Boolean) as {
      id: string;
      title: string;
      colors: ReturnType<typeof getProjectColor>;
    }[];
  }, [sessionsByDay, projects]);

  const hourHeight = 60; // px per hour
  const timelineStartHour = 0;
  const timelineEndHour = 24;

  const toY = (date: Date) => {
    // Convert a date to a Y-position within the day timeline
    const minutes = date.getHours() * 60 + date.getMinutes();
    const totalMinutes = (timelineEndHour - timelineStartHour) * 60;
    const y = (minutes / totalMinutes) * (totalMinutes / 60) * hourHeight;
    return clamp(y, 0, (timelineEndHour - timelineStartHour) * hourHeight);
  };

  function mergeAdjacentSessionsForRender(
    items: CalendarSession[]
  ): CalendarSession[] {
    if (items.length === 0) return items;
    const sorted = [...items].sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
    const merged: CalendarSession[] = [];
    for (const current of sorted) {
      const prev = merged[merged.length - 1];
      if (
        prev &&
        prev.project_id === current.project_id &&
        (prev.memo || "") === (current.memo || "") &&
        new Date(current.start_time).getTime() <=
          new Date(prev.end_time).getTime()
      ) {
        // merge with previous
        const durationPrev =
          (new Date(prev.end_time).getTime() -
            new Date(prev.start_time).getTime()) /
          1000;
        const durationCur =
          (new Date(current.end_time).getTime() -
            new Date(current.start_time).getTime()) /
          1000;
        merged[merged.length - 1] = {
          ...prev,
          id: `${prev.id}+${current.id}`,
          end_time:
            new Date(current.end_time).getTime() >
            new Date(prev.end_time).getTime()
              ? current.end_time
              : prev.end_time,
          active_seconds:
            (prev.active_seconds || durationPrev) +
            (current.active_seconds || durationCur),
        };
      } else {
        merged.push({ ...current });
      }
    }
    return merged;
  }

  useEffect(() => {
    // Measure sticky header height and column width for lane layout
    if (firstHeaderRef.current) {
      const rect = firstHeaderRef.current.getBoundingClientRect();
      setHeaderHeight(rect.height);
    }
    if (firstColumnContainerRef.current) {
      const rect = firstColumnContainerRef.current.getBoundingClientRect();
      setColumnWidth(rect.width);
    }
  }, [viewMode, referenceDate, firstHeaderRef]);

  useEffect(() => {
    // On initial mount, scroll to 07:00 (6 * hourHeight from midnight)
    if (viewport.current) {
      viewport.current.scrollTo({
        top: (6 - timelineStartHour) * hourHeight,
        behavior: "auto",
      });
    }
  }, []);

  const timeColumn = () => (
    <TimeColumn
      headerHeight={headerHeight}
      hourHeight={hourHeight}
      startHour={timelineStartHour}
      endHour={timelineEndHour}
    />
  );

  const dayColumn = (day: Date, isFirst: boolean) => {
    const key = getStartOfDay(day).toISOString().slice(0, 10);
    const items = sessionsByDay.get(key) ?? [];
    const dayStart = getStartOfDay(day);
    const dayEnd = addDays(dayStart, 1);
    const clippedItems: CalendarSession[] = items.map((s) => {
      const sStart = new Date(s.start_time);
      const sEnd = new Date(s.end_time);
      const start = sStart < dayStart ? dayStart : sStart;
      const end = sEnd > dayEnd ? dayEnd : sEnd;
      return {
        id: s.id,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        project_id: s.project_id,
        memo: s.memo,
        payed: s.payed,
        active_seconds: s.active_seconds,
      };
    });
    const itemsForRender: CalendarSession[] =
      mergeAdjacentSessionsForRender(clippedItems);

    return (
      <DayColumn
        key={key}
        day={day}
        items={items}
        isFirst={isFirst}
        hourHeight={hourHeight}
        startHour={timelineStartHour}
        endHour={timelineEndHour}
        headerRef={firstHeaderRef as React.RefObject<HTMLDivElement>}
        columnRef={firstColumnContainerRef as React.RefObject<HTMLDivElement>}
        columnWidth={columnWidth}
        toY={toY}
        getEarnedSalary={getEarnedSalary}
        projects={projects.map((p) => ({ id: p.id, title: p.title }))}
      />
    );
  };

  return (
    <Paper withBorder radius="lg" p="md" mb="sm">
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
          {/* Legend: show projects visible in the current range with their colors */}
          {visibleProjects.length > 0 && (
            <Group gap="xs" wrap="wrap">
              {visibleProjects.map((p) => (
                <Group key={p.id} gap={6} wrap="nowrap">
                  <Box
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 10,
                      background: p.colors.rail,
                      boxShadow: `0 0 0 1px ${p.colors.border}`,
                    }}
                  />
                  <Text size="xs">{p.title}</Text>
                </Group>
              ))}
            </Group>
          )}
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
          offsetScrollbars
          viewportRef={viewport}
        >
          <Group align="flex-start" wrap="nowrap" gap={0}>
            {timeColumn()}
            {days.map((d, idx) => (
              <Box
                key={`day-${getStartOfDay(d).toISOString().slice(0, 10)}`}
                style={{ flex: 1, minWidth: 0 }}
              >
                {dayColumn(d, idx === 0)}
              </Box>
            ))}
          </Group>
        </ScrollArea>
      </Stack>
    </Paper>
  );
}
