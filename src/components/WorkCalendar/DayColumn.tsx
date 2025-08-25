"use client";

import { useHover, useHotkeys } from "@mantine/hooks";
import { useSettingsStore } from "@/stores/settingsStore";

import { Box, Skeleton, Stack, Text } from "@mantine/core";

import {
  getStartOfDay,
  getEndOfDay,
  mergeAdjacentSessionsForRender,
} from "./calendarUtils";
import { CalendarSession } from "@/types/workCalendar.types";
import CalendarEvent from "./CalendarEvent/CalendarEvent";
import TimeTrackerEvent from "./CalendarEvent/TimeTrackerEvent/TimeTrackerEvent";
import NewSessionEvent from "./CalendarEvent/NewSessionEvent";

interface DayColumnProps {
  day: Date;
  y: number;
  yToTime: (y: number, day: Date) => Date;
  toY: (date: Date) => number;
  isFetching: boolean;
  currentTime?: Date;
  sessions: CalendarSession[];
  handleSessionClick: (sessionId: string) => void;
  hourMultiplier: number;
  rasterHeight: number;
  startNewSession: number | null;
  setStartNewSession: (y: number | null) => void;
  newSessionDay: Date | null;
  setNewSessionDay: (day: Date | null) => void;
}

export function DayColumn({
  day,
  y,
  yToTime,
  toY,
  isFetching,
  currentTime,
  sessions,
  handleSessionClick,
  hourMultiplier,
  rasterHeight,
  startNewSession,
  setStartNewSession,
  newSessionDay,
  setNewSessionDay,
}: DayColumnProps) {
  const { hovered, ref: hoverRef } = useHover();
  const { locale } = useSettingsStore();

  useHotkeys([["escape", () => setStartNewSession(null)]]);

  // Clip sessions to the visible day window so cross-midnight sessions
  // render only the portion within this column. This avoids negative/overflowing heights.
  const dayStart = getStartOfDay(day);
  const dayEnd = getEndOfDay(day);

  const clippedItems: CalendarSession[] = sessions.map((s) => {
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
      projectTitle: s.projectTitle,
      color: s.color,
      currency: s.currency,
      salary: s.salary,
    };
  });
  // Merge touching/overlapping sessions for the same project+memo to reduce clutter
  const itemsForRender: CalendarSession[] =
    mergeAdjacentSessionsForRender(clippedItems);

  function handleNewSessionClick(y: number) {
    if (startNewSession === null) {
      setStartNewSession(y);
      setNewSessionDay(day);
    }
  }

  return (
    <Box ref={hoverRef}>
      <Box
        style={{
          position: "relative",
          height: rasterHeight * 24 * hourMultiplier,
          border: currentTime
            ? "2px solid light-dark(var(--mantine-color-gray-9), var(--mantine-color-gray-3))"
            : "1px solid light-dark(var(--mantine-color-gray-6), var(--mantine-color-gray-6))",
          borderRadius: 0,
          background: currentTime
            ? "light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))"
            : "light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-7))",
          overflow: "hidden",
        }}
      >
        {/* Grid lines */}
        {Array.from(
          { length: 24 * hourMultiplier + 1 },
          (_, i) =>
            i !== 0 && (
              <Box
                key={`line-${i}`}
                style={{
                  position: "absolute",
                  top: i * rasterHeight,
                  left: 0,
                  right: 0,
                  height: 1,
                  borderTop:
                    "1px dashed light-dark(var(--mantine-color-gray-8), var(--mantine-color-gray-2))",
                  background: "none",
                  pointerEvents: "none",
                }}
              />
            )
        )}

        {/* Current time indicator - red line for today */}
        <TimeTrackerEvent toY={toY} currentTime={currentTime} day={day} />

        {/* New session event */}
        {!isFetching && hovered && startNewSession === null && (
          <Stack
            onClick={(e) => {
              e.stopPropagation();
              handleNewSessionClick(y);
            }}
            style={{
              position: "absolute",
              top: y - 2,
              left: 0,
              right: 0,
              borderTop:
                "3px solid light-dark(var(--mantine-color-teal-6), var(--mantine-color-teal-7))",
              zIndex: 10,
            }}
          >
            <Text ta="center">
              {yToTime(y, day).toLocaleTimeString(locale, {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </Stack>
        )}

        {!isFetching && startNewSession !== null && newSessionDay === day && (
          <NewSessionEvent
            start={startNewSession}
            y={y}
            yToTime={(y) => yToTime(y, day)}
          />
        )}

        {isFetching
          ? Array.from({ length: 24 }, (_, i) => (
              <Skeleton
                key={`line-${i}`} 
                height={rasterHeight + i * 3}
                w="90%"
                mx="auto"
                style={{
                  position: "absolute",
                  top: i * (rasterHeight + i * 3 + 30),
                  border:
                    "1px solid light-dark(var(--mantine-color-gray-7), var(--mantine-color-gray-4))",
                  borderLeft:
                    "6px solid light-dark(var(--mantine-color-gray-5), var(--mantine-color-gray-6))",
                }}
              />
            ))
          : itemsForRender.map((s) => {
              return (
                <CalendarEvent
                  key={s.id}
                  isNewSession={startNewSession !== null}
                  s={s}
                  toY={toY}
                  handleSessionClick={handleSessionClick}
                  color={s.color}
                />
              );
            })}
      </Box>
    </Box>
  );
}
