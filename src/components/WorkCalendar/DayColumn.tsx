"use client";

import { useState } from "react";
import { useMouse, useHover, useHotkeys } from "@mantine/hooks";
import { useSettingsStore } from "@/stores/settingsStore";

import { Box, Skeleton, Stack, Text } from "@mantine/core";

import {
  getStartOfDay,
  getEndOfDay,
  clamp,
  mergeAdjacentSessionsForRender,
} from "./calendarUtils";
import { CalendarSession } from "@/types/workCalendar.types";
import CalendarEvent from "./CalendarEvent/CalendarEvent";
import TimeTrackerEvent from "./CalendarEvent/TimeTrackerEvent/TimeTrackerEvent";
import NewSessionEvent from "./CalendarEvent/NewSessionEvent";

interface DayColumnProps {
  day: Date;
  isFetching: boolean;
  currentTime?: Date;
  sessions: CalendarSession[];
  handleSessionClick: (sessionId: string) => void;
  hourMultiplier: number;
  rasterHeight: number;
}

export function DayColumn({
  day,
  isFetching,
  currentTime,
  sessions,
  handleSessionClick,
  hourMultiplier,
  rasterHeight,
}: DayColumnProps) {
  const [newSessionTimes, setNewSessionTimes] = useState<{
    start: number | null;
    end: number | null;
  }>({ start: null, end: null });
  const { ref, x, y } = useMouse();
  const { hovered, ref: hoverRef } = useHover();
  const { locale } = useSettingsStore();

  useHotkeys([
    ["escape", () => setNewSessionTimes({ start: null, end: null })],
  ]);

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
    };
  });
  // Merge touching/overlapping sessions for the same project+memo to reduce clutter
  const itemsForRender: CalendarSession[] =
    mergeAdjacentSessionsForRender(clippedItems);

  const toY = (date: Date) => {
    // Convert a date to a Y-position within the day timeline
    const minutes = date.getHours() * 60 + date.getMinutes();
    const totalMinutes = 24 * 60;
    const y =
      (minutes / totalMinutes) *
      (totalMinutes / 60) *
      rasterHeight *
      hourMultiplier;
    return clamp(y, 0, 24 * rasterHeight * hourMultiplier);
  };

  const yToTime = (y: number) => {
    const minutes = (y / (rasterHeight * hourMultiplier)) * 60;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return new Date(0, 0, 0, hours, remainingMinutes).toLocaleTimeString(
      locale,
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  function handleNewSessionClick(y: number) {
    if (newSessionTimes.start === null) {
      setNewSessionTimes({ start: y, end: null });
    } else {
      setNewSessionTimes({
        start: Math.max(newSessionTimes.start, y),
        end: Math.min(newSessionTimes.start, y),
      });
    }
  }

  return (
    <Box ref={hoverRef}>
      <Box
        ref={ref}
        mb="xl"
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

        {hovered && (
          <Stack
            onClick={() => handleNewSessionClick(y)}
            style={{
              position: "absolute",
              top: y,
              left: 0,
              right: 0,
              borderTop:
                "3px solid light-dark(var(--mantine-color-teal-6), var(--mantine-color-teal-7))",
            }}
          >
            {newSessionTimes.start === null && (
              <Text ta="center">{yToTime(y)}</Text>
            )}
          </Stack>
        )}

        {newSessionTimes.start !== null && (
          <NewSessionEvent
            start={newSessionTimes.start}
            y={y}
            yToTime={yToTime}
          />
        )}

        {/* Bubble layout: assign a horizontal lane to avoid overlaps when many small sessions cluster */}
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
