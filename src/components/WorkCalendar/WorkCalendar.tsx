"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useWorkStore } from "@/stores/workManagerStore";
import useSettingsStore from "@/stores/settingsStore";

import {
  Grid,
  Group,
  ScrollArea,
  SegmentedControl,
  Stack,
  Title,
  ActionIcon,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import PrevActionIcon from "@/components/UI/ActionIcons/PrevActionIcon";
import NextActionIcon from "@/components/UI/ActionIcons/NextActionIcon";
import CalendarGrid from "./Calendar/CalendarGrid";
import TimerSessionDrawer from "@/components/Work/Session/TimerSessionDrawer";
import CalendarLegend from "./Calendar/CalendarLegend";

import { getStartOfDay } from "./calendarUtils";
import { startOfWeek, endOfWeek, addDays } from "date-fns";

import { CalendarSession, ViewMode } from "@/types/workCalendar.types";
import { CalendarDay } from "@/types/workCalendar.types";
import { Tables } from "@/types/db.types";

const zoomLevel = [1, 2, 4, 6, 12]; // multiplier for hour height
const zoomLabels = ["1 h", "30 min", "15 min", "10 min", "5 min"];
const rasterHeight = 60; // px per hour

export default function WorkCalendar() {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    addDays(startOfWeek(new Date()), 1),
    addDays(endOfWeek(new Date()), 1),
  ]);
  const [zoomIndex, setZoomIndex] = useState(1);
  const [viewportTop, setViewportTop] = useState({
    old: 0,
    new: 0,
    isSmooth: false,
  });
  const [selectedSession, setSelectedSession] =
    useState<Tables<"timer_session"> | null>(null);
  const [drawerOpened, { open, close }] = useDisclosure(false);
  const { projects: timerProjects, timerSessions, isFetching } = useWorkStore();
  const projects = timerProjects.map((project) => project.project);
  const viewport = useRef<HTMLDivElement>(null);
  const { locale } = useSettingsStore();

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

  function getCurrentTime() {
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();
    return (currentHour * 60 + currentMinute) / 60;
  }

  function handleReferenceDateChange(date: Date) {
    setReferenceDate(date);
    setViewMode("day");
  }

  function handleSessionClick(sessionId: string) {
    const session = timerSessions.find((s) => s.id === sessionId);
    if (session) {
      setSelectedSession(session);
      open();
    }
  }

  useEffect(() => {
    if (!isFetching) {
      const currentTime = getCurrentTime();
      setViewportTop((prev) => ({
        old: prev.old,
        new: currentTime * rasterHeight * zoomLevel[zoomIndex] + 50,
        isSmooth: true,
      }));
    }
  }, [isFetching]);

  useEffect(() => {
    if (viewport.current && viewportTop.new !== viewportTop.old) {
      viewport.current.scrollTo({
        top: viewportTop.new,
        behavior: viewportTop.isSmooth ? "smooth" : "instant",
      });
      setViewportTop({
        old: viewportTop.new,
        new: viewportTop.new,
        isSmooth: true,
      });
    }
  }, [viewportTop, viewport.current]);

  function handleZoomChange(oldIndex: number, newIndex: number) {
    if (viewport.current) {
      const currentTimeTop =
        (viewport.current.scrollTop - 100) /
        (rasterHeight * zoomLevel[oldIndex]);

      const roundedTimeTop = Math.round(currentTimeTop * 100) / 100;

      const newTop = roundedTimeTop * rasterHeight * zoomLevel[newIndex] + 100;

      setViewportTop((prev) => ({
        old: prev.new,
        new: newTop,
        isSmooth: false,
      }));
    }
  }

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
          <Grid.Col span={2}>
            <Group justify="flex-start" ml="md" gap="xs">
              <ActionIcon.Group>
                <ActionIcon
                  variant="light"
                  color="red"
                  size="lg"
                  radius="md"
                  onClick={() => {
                    const currentZoomIndex = zoomIndex;
                    setZoomIndex((prev) => prev - 1);
                    handleZoomChange(currentZoomIndex, currentZoomIndex - 1);
                  }}
                  disabled={zoomIndex === 0}
                >
                  <IconMinus color="var(--mantine-color-red-text)" />
                </ActionIcon>
                <ActionIcon.GroupSection
                  variant="default"
                  size="lg"
                  bg="var(--mantine-color-body)"
                  miw={85}
                  ta="center"
                  fw={600}
                >
                  {zoomLabels[zoomIndex]}
                </ActionIcon.GroupSection>
                <ActionIcon
                  variant="light"
                  size="lg"
                  radius="md"
                  onClick={() => {
                    const currentZoomIndex = zoomIndex;
                    setZoomIndex((prev) => prev + 1);
                    handleZoomChange(currentZoomIndex, currentZoomIndex + 1);
                  }}
                  disabled={zoomIndex === 4}
                >
                  <IconPlus color="var(--mantine-color-teal-text)" />
                </ActionIcon>
              </ActionIcon.Group>
            </Group>
          </Grid.Col>
          <Grid.Col span={8}>
            <Group gap="xs" justify="center">
              <PrevActionIcon
                onClick={() =>
                  setReferenceDate(
                    addDays(referenceDate, viewMode === "day" ? -1 : -7)
                  )
                }
              />
              {viewMode === "day" ? (
                <DatePickerInput
                  value={referenceDate}
                  locale={locale}
                  onChange={(value) => {
                    if (value) {
                      setReferenceDate(new Date(value));
                    }
                  }}
                />
              ) : (
                <DatePickerInput
                  allowSingleDateInRange
                  type="range"
                  value={dateRange}
                  valueFormat={
                    locale === "de-DE" ? "D MMM, YYYY" : "MMM D, YYYY"
                  }
                  locale={locale}
                  onChange={(value) => {
                    const [start, end] = value;
                    setDateRange([
                      start ? new Date(start) : null,
                      end ? new Date(end) : null,
                    ]);
                    start && setReferenceDate(new Date(start));
                  }}
                />
              )}
              <NextActionIcon
                onClick={() =>
                  setReferenceDate(
                    addDays(referenceDate, viewMode === "day" ? 1 : 7)
                  )
                }
              />
            </Group>
          </Grid.Col>
          <Grid.Col span={2}>
            <Group justify="flex-end" mr="md" gap="xs">
              <SegmentedControl
                ml="md"
                value={viewMode}
                onChange={(v) => setViewMode(v as ViewMode)}
                data={[
                  { label: "Day", value: "day" },
                  { label: "Week", value: "week" },
                ]}
              />
            </Group>
          </Grid.Col>
        </Grid>
        <CalendarGrid
          isFetching={isFetching}
          days={calendarDays}
          setReferenceDate={handleReferenceDateChange}
          handleSessionClick={handleSessionClick}
          hourMultiplier={zoomLevel[zoomIndex]}
          rasterHeight={rasterHeight}
        />
      </Stack>
      {visibleProjects.length > 0 && (
        <CalendarLegend visibleProjects={visibleProjects} />
      )}
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
