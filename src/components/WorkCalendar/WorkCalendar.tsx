"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useWorkStore } from "@/stores/workManagerStore";

import {
  Box,
  Button,
  Grid,
  Group,
  Loader,
  Center,
  ScrollArea,
  SegmentedControl,
  Stack,
  Text,
  Title,
  Popover,
  ColorPicker,
  DEFAULT_THEME,
} from "@mantine/core";
import PrevActionIcon from "@/components/UI/ActionIcons/PrevActionIcon";
import NextActionIcon from "@/components/UI/ActionIcons/NextActionIcon";
import CalendarGrid from "./Calendar/CalendarGrid";
import TimerSessionDrawer from "@/components/Work/Session/TimerSessionDrawer";

import { formatDate } from "@/utils/workHelperFunctions";
import { addDays, getStartOfDay } from "./calendarUtils";

import { CalendarSession, ViewMode } from "@/types/workCalendar.types";
import { CalendarDay } from "@/types/workCalendar.types";
import { Tables } from "@/types/db.types";

export default function WorkCalendar() {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());
  const [selectedSession, setSelectedSession] =
    useState<Tables<"timer_session"> | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("#000000");
  const [drawerOpened, { open, close }] = useDisclosure(false);
  const {
    projects: timerProjects,
    timerSessions,
    isFetching,
    updateProject,
  } = useWorkStore();
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
    const map = new Map<string, CalendarSession[]>();
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
        const project = projects.find((p) => p.id === s.project_id);
        if (overlaps) {
          const key = dayStart.toISOString().slice(0, 10);
          map.get(key)?.push({
            ...s,
            projectTitle: project?.title ?? "",
            color: project?.color ?? "var(--mantine-color-teal-6)",
          });
        }
      });
    });
    return map;
  }, [timerSessions, days, projects]);

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

    // Sort projects by total time (descending) and assign colors based on time ranking
    const activeProjects = Array.from(ids)
      .map((id) => {
        const p = projects.find((pp) => pp.id === id);
        if (!p) return undefined;
        return {
          id,
          title: p.title,
          color: p.color ?? "var(--mantine-color-teal-6)",
        };
      })
      .filter((p) => p !== undefined);

    if (activeProjects.length === 0) return [];

    return activeProjects;
  }, [sessionsByDay, projects]);

  function handleReferenceDateChange(date: Date) {
    setReferenceDate(date);
    setViewMode("day");
    viewport.current?.scrollTo({
      top: 8 * hourHeight,
      behavior: "smooth",
    });
  }

  function handleSessionClick(sessionId: string) {
    const session = timerSessions.find((s) => s.id === sessionId);
    if (session) {
      setSelectedSession(session);
      open();
    }
  }

  const hourHeight = 60; // px per hour

  useEffect(() => {
    if (viewport.current && !isFetching) {
      setSelectedSession(timerSessions[0] ?? null);
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
          h={60}
          columns={12}
          align="center"
          justify="center"
          w="100%"
          pt="xs"
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
                <Group wrap="wrap" justify="center" gap={5}>
                  {visibleProjects.map((p) => (
                    <Popover
                      key={p.id}
                      onOpen={() => {
                        setSelectedColor(p.color);
                      }}
                      onClose={() => {
                        updateProject({
                          id: p.id,
                          color: selectedColor,
                        });
                      }}
                    >
                      <Popover.Target>
                        <Button
                          c="light-dark(var(--mantine-color-black), var(--mantine-color-white))"
                          variant="subtle"
                          size="xs"
                          leftSection={
                            <Box
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: 10,
                                background: p.color,
                                boxShadow: `0 0 0 1px ${p.color}`,
                              }}
                            />
                          }
                        >
                          {p.title}
                        </Button>
                      </Popover.Target>
                      <Popover.Dropdown>
                        <ColorPicker
                          value={selectedColor}
                          onChange={(color) => {
                            setSelectedColor(color);
                          }}
                          swatches={[
                            DEFAULT_THEME.colors.red[6],
                            DEFAULT_THEME.colors.pink[6],
                            DEFAULT_THEME.colors.grape[6],
                            DEFAULT_THEME.colors.violet[6],
                            DEFAULT_THEME.colors.indigo[6],
                            DEFAULT_THEME.colors.blue[6],
                            DEFAULT_THEME.colors.cyan[6],
                            DEFAULT_THEME.colors.teal[6],
                            DEFAULT_THEME.colors.green[6],
                            DEFAULT_THEME.colors.lime[6],
                            DEFAULT_THEME.colors.yellow[6],
                            DEFAULT_THEME.colors.orange[6],
                          ]}
                        />
                      </Popover.Dropdown>
                    </Popover>
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
        <CalendarGrid
          days={calendarDays}
          setReferenceDate={handleReferenceDateChange}
          handleSessionClick={handleSessionClick}
        />
      </Stack>
      {selectedSession && (
        <TimerSessionDrawer
          timerSession={selectedSession}
          opened={drawerOpened}
          close={close}
        />
      )}
    </ScrollArea>
  );
}
