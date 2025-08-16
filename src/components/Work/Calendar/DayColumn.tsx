"use client";

import { useState } from "react";

import { Box, Group, Stack, Text, HoverCard } from "@mantine/core";
import { Tables } from "@/types/db.types";
import {
  CalendarSession,
  clamp,
  getProjectColor,
  getStartOfDay,
  mergeAdjacentSessionsForRender,
} from "./calendarUtils";
import TimerSessionDrawer from "../Session/TimerSessionDrawer";
import { formatTimeSpan } from "@/utils/workHelperFunctions";

interface DayColumnProps {
  day: Date;
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
}

export function DayColumn({
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
}: DayColumnProps) {
  const [drawerSession, setDrawerSession] =
    useState<Tables<"timer_session"> | null>(null);
  const [drawerOpened, setDrawerOpened] = useState(false);
  // Clip sessions to the visible day window so cross-midnight sessions
  // render only the portion within this column. This avoids negative/overflowing heights.
  const dayStart = getStartOfDay(day);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayStart.getDate() + 1);

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
    <Box style={{ flex: 1, minWidth: 0 }}>
      <Stack gap="xs">
        {/* Sticky header showing date and earned summary */}
        <Stack
          pb="xs"
          align="center"
          ref={isFirst ? headerRef : undefined}
          style={{
            position: "sticky",
            top: 0,
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

          {/* Bubble layout: assign a horizontal lane to avoid overlaps when many small sessions cluster */}
          {(() => {
            const laneHeights: number[] = [];
            const availableWidth = Math.max(
              (columnWidth || 220) - (16 + 12) - 8,
              100
            );
            const laneWidth = Math.min(160, availableWidth);
            const bubbleHeight = 26;
            const railLeft = 3;
            const segmentWidth = 6;
            const containerHeight = hourHeight * (endHour - startHour);
            const chooseLane = (top: number) => {
              for (let i = 0; i < laneHeights.length; i++) {
                if (laneHeights[i] + 4 <= top) {
                  return i;
                }
              }
              laneHeights.push(0);
              return laneHeights.length - 1;
            };
            return itemsForRender.map((s) => {
              const start = new Date(s.start_time);
              const end = new Date(s.end_time);
              const top = toY(start);
              const bottom = toY(end);
              const height = Math.max(bottom - top, 4);
              const colors = getProjectColor(String(s.project_id));
              const segmentLeft = railLeft - Math.floor(segmentWidth / 2);
              const centerY = top + height / 2;
              const bubbleTop = clamp(
                Math.round(centerY - bubbleHeight / 2),
                0,
                containerHeight - bubbleHeight
              );
              const laneIndex = chooseLane(bubbleTop);
              const bubbleLeft = railLeft + 12 + laneIndex * laneWidth;
              laneHeights[laneIndex] = bubbleTop + bubbleHeight;

              const projectTitle =
                projects.find((p) => p.id === s.project_id)?.title || "Projekt";

              return (
                <Box key={s.id}>
                  <HoverCard openDelay={100} closeDelay={100}>
                    <HoverCard.Target>
                      {/* Segment on the rail */}
                      <Box
                        onClick={() => handleSessionClick(s)}
                        style={{
                          position: "absolute",
                          left: segmentLeft,
                          top,
                          width: segmentWidth,
                          height,
                          borderRadius: 3,
                          background: colors.rail,
                          cursor: "pointer",
                        }}
                      />
                    </HoverCard.Target>
                    <HoverCard.Dropdown>
                      <Stack>
                        <Text>{projectTitle}</Text>
                        {s.memo && <Text>{s.memo}</Text>}
                        <Text>
                          {formatTimeSpan(
                            new Date(s.start_time),
                            new Date(s.end_time)
                          )}
                        </Text>
                      </Stack>
                    </HoverCard.Dropdown>
                  </HoverCard>
                  {/* Pointer connecting bubble to the rail */}
                  <Box
                    style={{ cursor: "pointer" }}
                    onClick={() => handleSessionClick(s)}
                  >
                    <HoverCard openDelay={100} closeDelay={100}>
                      <HoverCard.Target>
                        <Box
                          style={{
                            position: "absolute",
                            left: bubbleLeft - 3,
                            top: bubbleTop + Math.round(bubbleHeight / 2) - 5,
                            width: 10,
                            height: 10,
                            background: "var(--mantine-color-body)",
                            transform: "rotate(45deg)",
                            boxShadow: `-1px 1px 0 0 ${colors.border}`,
                            zIndex: 1,
                          }}
                        />
                      </HoverCard.Target>
                      <HoverCard.Dropdown>
                        <Stack>
                          <Text>{projectTitle}</Text>
                          {s.memo && <Text>{s.memo}</Text>}
                          <Text>
                            {formatTimeSpan(
                              new Date(s.start_time),
                              new Date(s.end_time)
                            )}
                          </Text>
                        </Stack>
                      </HoverCard.Dropdown>
                    </HoverCard>
                    {/* Bubble itself (compact, ellipsized content) */}
                    <Box
                      style={{
                        position: "absolute",
                        left: bubbleLeft,
                        top: bubbleTop,
                        minHeight: bubbleHeight,
                        maxWidth: laneWidth - 10,
                        padding: "4px 6px",
                        borderRadius: 8,
                        background: "var(--mantine-color-body)",
                        boxShadow: `inset 0 0 0 1px ${colors.border}`,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Box
                        style={{
                          width: 8,
                          height: 8,
                          zIndex: 2,
                          borderRadius: 8,
                          background: colors.rail,
                          boxShadow: `0 0 0 1px ${colors.border}`,
                          flex: "0 0 auto",
                        }}
                      />
                      <Box style={{ minWidth: 0 }}>
                        <Text
                          size="xs"
                          fw={600}
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {projectTitle}
                        </Text>
                        {s.memo && (
                          <Text
                            size="xs"
                            c="dimmed"
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {s.memo}
                          </Text>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            });
          })()}
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
