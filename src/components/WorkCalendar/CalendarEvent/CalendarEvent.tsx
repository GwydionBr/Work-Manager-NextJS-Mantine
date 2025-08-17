"use client";

import { useEffect, useState } from "react";
import { useHover } from "@mantine/hooks";

import { Box, Text } from "@mantine/core";

import {
  clamp,
  getProjectColor,
} from "@/components/WorkCalendar/calendarUtils";

import { CalendarSession, ViewMode } from "@/types/workCalendar.types";
import { formatTimeSpan } from "@/utils/workHelperFunctions";

interface CalendarEventProps {
  s: CalendarSession;
  toY: (date: Date) => number;
  visibleProjects: {
    id: string;
    title: string;
    colors: {
      rail: string;
      border: string;
      fill: string;
    };
  }[];
  handleSessionClick: (session: CalendarSession) => void;
  viewMode: ViewMode;
  containerHeight: number;
  chooseLane: (top: number) => number;
  laneHeights: number[];
}

export default function CalendarEvent({
  s,
  toY,
  visibleProjects,
  handleSessionClick,
  viewMode,
  containerHeight,
  chooseLane,
  laneHeights,
}: CalendarEventProps) {
  const { hovered, ref } = useHover();
  const { hovered: hovered2, ref: ref2 } = useHover();
  const { hovered: hovered3, ref: ref3 } = useHover();
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (hovered || hovered2 || hovered3) {
      setOpened(true);
    } else {
      setOpened(false);
    }
  }, [hovered, hovered2, hovered3]);

  const start = new Date(s.start_time);
  const end = new Date(s.end_time);
  const top = toY(start);
  const bottom = toY(end);
  const height = Math.max(bottom - top, 4);
  const colors =
    visibleProjects.find((p) => p.id === String(s.project_id))?.colors ||
    getProjectColor(String(s.project_id));
  const centerY = top + height / 2;
  const bubbleHeight = 26;
  const bubbleTop = clamp(
    Math.round(centerY - bubbleHeight / 2),
    0,
    containerHeight - bubbleHeight
  );
  const laneIndex = chooseLane(bubbleTop);
  laneHeights[laneIndex] = bubbleTop + bubbleHeight;

  return (
    <Box>
      <Box
        ref={ref}
        onClick={() => handleSessionClick(s)}
        style={{
          position: "absolute",
          left: 0,
          top,
          width: 10,
          height,
          borderRadius: 5,
          background: colors.rail,
          cursor: "pointer",
          border: `1px solid light-dark(var(--mantine-color-gray-9), var(--mantine-color-gray-0))`,
        }}
      />
      <Box style={{ cursor: "pointer" }} onClick={() => handleSessionClick(s)}>
        {/* Pointer connecting bubble to the rail */}
        <Box
          ref={ref2}
          style={{
            position: "absolute",
            left: 13,
            top: bubbleTop + Math.round(bubbleHeight / 2) - 5,
            width: 10,
            height: 10,
            background: "var(--mantine-color-body)",
            transform: "rotate(45deg)",
            boxShadow: `-1px 1px 0 0 ${colors.border}`,
            zIndex: 1,
          }}
        />
        {/* Bubble itself (compact, ellipsized content) */}
        <Box
          mr={5}
          style={{
            position: "absolute",
            left: 16,
            top: bubbleTop,
            minHeight: bubbleHeight,
            minWidth: viewMode === "day" ? "50%" : "70%",
            maxWidth: 300,
            padding: "4px 6px",
            borderRadius: 8,
            background: "var(--mantine-color-body)",
            boxShadow: `inset 0 0 0 1px ${colors.border}`,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {/* <Box
            style={{
              width: 8,
              height: 8,
              zIndex: 2,
              borderRadius: 8,
              background: colors.rail,
              boxShadow: `0 0 0 1px ${colors.border}`,
              flex: "0 0 auto",
            }}
          /> */}
          <Box style={{ maxWidth: 400 }}>
            <Text size="xs" >
              {formatTimeSpan(start, end)}
            </Text>
            {s.memo && (
              <Text size="xs" c="dimmed">
                {s.memo}
              </Text>
            )}
            <Text
              maw="100%"
              size="xs"
              fw={600}
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {s.projectTitle}
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
