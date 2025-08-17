"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useWorkStore } from "@/stores/workManagerStore";

import {
  Box,
  Grid,
  Group,
  Loader,
  Center,
  ScrollArea,
  SegmentedControl,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import PrevActionIcon from "@/components/UI/ActionIcons/PrevActionIcon";
import NextActionIcon from "@/components/UI/ActionIcons/NextActionIcon";
import { DayColumn } from "./DayColumn";
import { TimeColumn } from "./TimeColumn";

import { formatDate } from "@/utils/workHelperFunctions";
import {
  addDays,
  getStartOfDay,
  getProjectColorByTimeRank,
} from "./calendarUtils";

import { Tables } from "@/types/db.types";
import { ViewMode } from "@/types/workCalendar.types";
import { CalendarDay } from "@/types/workCalendar.types";

export default function WorkCalendar() {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());
  const { projects: timerProjects, timerSessions, isFetching } = useWorkStore();
  const projects = timerProjects.map((project) => project.project);
  const viewport = useRef<HTMLDivElement>(null);

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

  const calendarDays: CalendarDay[] = useMemo(() => {
    return days.map((d) => ({
      day: d,
      sessions: sessionsByDay.get(d.toISOString().slice(0, 10)) ?? [],
    }));
  }, [days, sessionsByDay]);

  // Projects visible in the current view (based on sessions overlapping the visible days)
  const visibleProjects = useMemo(() => {
    const ids = new Set<string>();
    sessionsByDay.forEach((items) => {
      items.forEach((s) => ids.add(String(s.project_id)));
    });

    // Calculate total time for each project in the visible range
    const projectTimeMap = new Map<string, number>();
    sessionsByDay.forEach((items) => {
      items.forEach((s) => {
        const projectId = String(s.project_id);
        const currentTime = projectTimeMap.get(projectId) || 0;
        projectTimeMap.set(projectId, currentTime + (s.active_seconds || 0));
      });
    });

    // Sort projects by total time (descending) and assign colors based on time ranking
    const sortedProjects = Array.from(ids)
      .map((id) => {
        const p = projects.find((pp) => pp.id === id);
        if (!p) return null;
        const totalTime = projectTimeMap.get(id) || 0;
        return { id, title: p.title, totalTime };
      })
      .filter(Boolean)
      .sort((a, b) => (b?.totalTime || 0) - (a?.totalTime || 0))
      .map((project, index) => ({
        id: project!.id,
        title: project!.title,
        colors: getProjectColorByTimeRank(index),
      })) as {
      id: string;
      title: string;
      colors: ReturnType<typeof getProjectColorByTimeRank>;
    }[];

    return sortedProjects;
  }, [sessionsByDay, projects]);

  const hourHeight = 60; // px per hour

  useEffect(() => {
    if (viewport.current && !isFetching) {
      viewport.current.scrollTo({
        top: 8 * hourHeight,
        behavior: "smooth",
      });
    }
  }, [isFetching]);

  return (
    <ScrollArea offsetScrollbars viewportRef={viewport} h="100vh">
      <Stack>
        <Title ta="center" order={1} mt="xs">
          Work Calendar
        </Title>
        <Grid
          columns={12}
          align="center"
          justify="center"
          w="100%"
          pt="xs"
          pb="md"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            background: "var(--mantine-color-body)",
          }}
        >
          <Grid.Col span={3}>
            <SegmentedControl
              ml="md"
              value={viewMode}
              onChange={(v) => setViewMode(v as ViewMode)}
              data={[
                { label: "Day", value: "day" },
                { label: "Week", value: "week" },
              ]}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            {/* Legend: show projects visible in the current range with their colors */}
            {isFetching ? (
              <Center>
                <Loader size="xs" />
              </Center>
            ) : (
              visibleProjects.length > 0 && (
                <Group gap="xs" wrap="wrap" justify="center">
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
              )
            )}
          </Grid.Col>
          <Grid.Col span={3}>
            <Group gap="xs" justify="flex-end">
              <PrevActionIcon
                onClick={() =>
                  setReferenceDate(
                    addDays(referenceDate, viewMode === "day" ? -1 : -7)
                  )
                }
              />
              <Text>{formatDate(referenceDate)}</Text>
              <NextActionIcon
                onClick={() =>
                  setReferenceDate(
                    addDays(referenceDate, viewMode === "day" ? 1 : 7)
                  )
                }
              />
            </Group>
          </Grid.Col>
        </Grid>
        <Grid columns={22} gutter={0}>
          <Grid.Col span={1}>
            <TimeColumn hourHeight={hourHeight} />
          </Grid.Col>
          {calendarDays.map((d) => {
            return (
              <Grid.Col
                span={3}
                key={`day-${getStartOfDay(d.day).toISOString().slice(0, 10)}`}
              >
                <DayColumn
                  viewMode={viewMode}
                  day={d.day}
                  sessions={d.sessions}
                  projects={projects.map((p) => ({ id: p.id, title: p.title }))}
                  visibleProjects={visibleProjects}
                />
              </Grid.Col>
            );
          })}
        </Grid>
      </Stack>
    </ScrollArea>
  );
}
