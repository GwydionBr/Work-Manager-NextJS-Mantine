"use client";

import { useState } from "react";

import { Box, Stack, Text, HoverCard } from "@mantine/core";
import TimerSessionDrawer from "@/components/Work/Session/TimerSessionDrawer";

import { Tables } from "@/types/db.types";
import {
  CalendarSession,
  clamp,
  getProjectColor,
  getStartOfDay,
  getEndOfDay,
  mergeAdjacentSessionsForRender,
} from "./calendarUtils";
import { formatTimeSpan } from "@/utils/workHelperFunctions";
import { ViewMode } from "@/types/workCalendar.types";
import CalendarEvent from "./CalendarEvent/CalendarEvent";

interface DayColumnProps {
  day: Date;
  viewMode: ViewMode;
  items: Tables<"timer_session">[];
  isFirst: boolean;
  hourHeight: number;
  startHour: number;
  endHour: number;
  headerRef?: React.RefObject<HTMLDivElement>;
  columnRef?: React.RefObject<HTMLDivElement>;
  columnWidth: number;
  toY: (date: Date) => number;
  getEarnedSalary: (
    items: Tables<"timer_session">[],
    unpaid: boolean
  ) => number;
  projects: { id: string; title: string }[];
  visibleProjects: {
    id: string;
    title: string;
    colors: {
      rail: string;
      border: string;
      fill: string;
    };
  }[];
}

export function DayColumn({
  viewMode,
  day,
  items,
  isFirst,
  hourHeight,
  startHour,
  endHour,
  headerRef,
  columnRef,
  columnWidth,
  toY,
  getEarnedSalary,
  projects,
  visibleProjects,
}: DayColumnProps) {
  const [drawerSession, setDrawerSession] =
    useState<Tables<"timer_session"> | null>(null);
  const [drawerOpened, setDrawerOpened] = useState(false);
  // Clip sessions to the visible day window so cross-midnight sessions
  // render only the portion within this column. This avoids negative/overflowing heights.
  const dayStart = getStartOfDay(day);
  const dayEnd = getEndOfDay(day);

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
  // Merge touching/overlapping sessions for the same project+memo to reduce clutter
  const itemsForRender: CalendarSession[] =
    mergeAdjacentSessionsForRender(clippedItems);

  const handleSessionClick = (session: CalendarSession) => {
    const item = items.find((i) => i.id === session.id);
    console.log(item);
    if (!item) return;
    setDrawerSession(item);
    setDrawerOpened(true);
  };

  return (
    <Box style={{ flex: 1, minWidth: 0 }} mb="md">
      <Stack gap="xs">
        {/* Sticky header showing date and earned summary */}
        <Stack
          pb="xs"
          align="center"
          ref={isFirst ? headerRef : undefined}
          style={{
            position: "sticky",
            top: 60,
            zIndex: 10,
            background: "var(--mantine-color-body)",
            borderBottom: "1px solid var(--mantine-color-gray-3)",
          }}
        >
          <Text fw={600}>
            {day.toLocaleDateString("en-US", {
              weekday: "short",
              day: "2-digit",
              month: "short",
            })}
          </Text>
        </Stack>
        {/* Main timeline area with a vertical rail, hourly dots and grid lines */}
        <Box
          ref={isFirst ? columnRef : undefined}
          style={{
            position: "relative",
            height: hourHeight * (endHour - startHour),
            border:
              "1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-gray-6))",
            borderRadius: 0,
            background:
              "light-dark(var(--mantine-color-gray-0), var(--mantine-color-gray-9))",
            overflow: "hidden",
          }}
        >
          {/* Grid lines */}
          {Array.from({ length: endHour - startHour + 1 }, (_, i) => (
            <Box
              key={`line-${startHour + i}`}
              style={{
                position: "absolute",
                top: i * hourHeight,
                left: 0,
                right: 0,
                height: 1,
                borderTop:
                  "1px dashed light-dark(var(--mantine-color-gray-3), var(--mantine-color-gray-6))",
                background: "none",
                pointerEvents: "none",
              }}
            />
          ))}

          <CalendarEvent
            itemsForRender={itemsForRender}
            columnWidth={columnWidth}
            hourHeight={hourHeight}
            startHour={startHour}
            endHour={endHour}
            toY={toY}
            visibleProjects={visibleProjects}
            projects={projects}
            handleSessionClick={handleSessionClick}
            viewMode={viewMode}
          />
        </Box>
      </Stack>
      {drawerSession && (
        <TimerSessionDrawer
          timerSession={drawerSession}
          opened={drawerOpened}
          close={() => setDrawerOpened(false)}
        />
      )}
    </Box>
  );
}
