"use client";
import dayjs from "dayjs";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDisclosure, useHotkeys } from "@mantine/hooks";
import { useWorkStore } from "@/stores/workManagerStore";
import { useCalendarStore } from "@/stores/calendarStore";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  Grid,
  Group,
  ScrollArea,
  SegmentedControl,
  Stack,
  ActionIcon,
  Loader,
  Center,
} from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import PrevActionIcon from "@/components/UI/ActionIcons/PrevActionIcon";
import NextActionIcon from "@/components/UI/ActionIcons/NextActionIcon";
import CalendarGrid from "./Calendar/CalendarGrid";
import EditSessionDrawer from "@/components/Work/Session/EditSessionDrawer";
import CalendarLegend from "./Calendar/CalendarLegend";
import LocaleDatePickerInput from "../UI/Locale/LocaleDatePickerInput";
import { DatePickerInput } from "@mantine/dates";

import { getStartOfDay } from "./calendarUtils";
import { addDays, isSameDay, differenceInCalendarDays } from "date-fns";

import {
  CalendarSession,
  ViewMode,
  CalendarDay,
  VisibleProject,
  CalendarAppointment,
} from "@/types/workCalendar.types";

const zoomLevel = [1, 2, 4, 6, 12]; // multiplier for hour height
const zoomLabels = ["1 h", "30 min", "15 min", "10 min", "5 min"];

export default function WorkCalendar() {
  const {
    appointments,
    viewMode,
    setViewMode,
    rasterHeight,
    addingMode,
    setAddingMode,
    referenceDate,
    setReferenceDate,
    selectedSession,
    setSelectedSession,
    dateRange,
    setDateRange,
    currentDateRange,
    setCurrentDateRange,
    zoomIndex,
    changeZoomIndex,
  } = useCalendarStore();
  const { locale } = useSettingsStore();
  const { projects: timerProjects, timerSessions, isFetching } = useWorkStore();
  const projects = timerProjects.map((project) => project.project);

  const [viewportTop, setViewportTop] = useState({
    old: 0,
    new: 0,
    isSmooth: false,
  });
  const [drawerOpened, { open, close }] = useDisclosure(false);
  const viewport = useRef<HTMLDivElement>(null);

  useHotkeys([
    [
      "Escape",
      () => {
        if (addingMode) {
          setAddingMode(false);
        }
      },
    ],
    [
      "mod + Enter",
      () => {
        if (!addingMode) {
          setAddingMode(true);
        }
      },
    ],
  ]);

  const today = dayjs();

  const days: Date[] = useMemo(() => {
    const [rangeStart, rangeEnd] = currentDateRange;
    if (viewMode === "day") return [getStartOfDay(referenceDate)];

    const start = getStartOfDay(rangeStart);
    const end = getStartOfDay(rangeEnd);
    const length = differenceInCalendarDays(end, start) + 1;
    return Array.from({ length }, (_, i) => addDays(start, i));
  }, [viewMode, currentDateRange, referenceDate]);

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

  const appointmentsByDay = useMemo(() => {
    const map = new Map<string, CalendarAppointment[]>();
    days.forEach((d) => {
      map.set(d.toISOString().slice(0, 10), []);
    });
    appointments.forEach((a) => {
      const start = new Date(a.start_date);
      const end = new Date(a.end_date);
      const day = a.start_date.slice(0, 10);
      days.forEach((d) => {
        const dayStart = getStartOfDay(d);
        const dayEnd = addDays(dayStart, 1);
        const overlaps = start < dayEnd && end > dayStart;
        const project = projects.find((p) => p.id === a.timer_project_id);
        if (overlaps) {
          map.get(day)?.push({
            ...a,
            projectTitle: project?.title ?? "",
            color: project?.color ?? "var(--mantine-color-teal-6)",
          });
        }
      });
    });
    return map;
  }, [appointments, days, projects]);

  const calendarDays: CalendarDay[] = useMemo(() => {
    return days.map((d) => ({
      day: d,
      sessions: sessionsByDay.get(d.toISOString().slice(0, 10)) ?? [],
      appointments: appointmentsByDay.get(d.toISOString().slice(0, 10)) ?? [],
    }));
  }, [days, sessionsByDay, appointmentsByDay]);
  console.log("calendarDays", calendarDays);

  // Projects visible in the current view (based on sessions overlapping the visible days)
  const visibleProjects: VisibleProject[] = useMemo(() => {
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
          salary: p.salary ?? 0,
          currency: p.currency ?? "USD",
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

  function setRangeAndMaybeSwitch(start: Date | null, end: Date | null) {
    if (!start && !end) {
      setDateRange([currentDateRange[0], currentDateRange[1]]);
      return;
    }
    setDateRange([start ? new Date(start) : null, end ? new Date(end) : null]);
    if (start && end) {
      setCurrentDateRange([start, end]);
      if (isSameDay(start, end)) {
        setReferenceDate(new Date(start));
        setViewMode("day");
      } else {
        setReferenceDate(new Date(start));
        setViewMode("week");
      }
    }
  }

  function handleNextAndPrev(delta: number = 1) {
    if (viewMode === "day") {
      setReferenceDate(addDays(referenceDate, delta));
      return;
    }
    const [s, e] = dateRange;
    if (s && e) {
      const len = differenceInCalendarDays(e, s) + 1;
      const ns = addDays(s, delta * len);
      const ne = addDays(e, delta * len);
      setDateRange([ns, ne]);
      setCurrentDateRange([ns, ne]);
      setReferenceDate(ns);
    } else {
      setReferenceDate(addDays(referenceDate, delta * 7));
    }
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
      handleScrollToNow();
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
        (viewport.current.scrollTop - 50) /
        (rasterHeight * zoomLevel[oldIndex]);

      const roundedTimeTop = Math.round(currentTimeTop * 100) / 100;

      const newTop = roundedTimeTop * rasterHeight * zoomLevel[newIndex] + 50;

      setViewportTop((prev) => ({
        old: prev.new,
        new: newTop,
        isSmooth: false,
      }));
    }
  }

  function handleScrollToNow() {
    if (viewport.current) {
      const currentTime = getCurrentTime();
      viewport.current.scrollTo({
        top: currentTime * rasterHeight * zoomLevel[zoomIndex],
        behavior: "smooth",
      });
    }
  }

  return (
    <ScrollArea
      viewportRef={viewport}
      h="100vh"
      type="never"
      scrollHideDelay={100}
      scrollbars="y"
    >
      <Stack>
        <Grid
          h={65}
          pt="md"
          columns={12}
          align="center"
          justify="center"
          w="100%"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            background: "var(--mantine-color-body)",
          }}
        >
          <Grid.Col span={3}>
            <Group justify="flex-start" ml="md" gap="xs">
              <ActionIcon.Group>
                <ActionIcon
                  variant="light"
                  color="red"
                  size="lg"
                  radius="md"
                  onClick={() => {
                    const currentZoomIndex = zoomIndex;
                    changeZoomIndex(-1);
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
                    changeZoomIndex(1);
                    handleZoomChange(currentZoomIndex, currentZoomIndex + 1);
                  }}
                  disabled={zoomIndex === 4}
                >
                  <IconPlus color="var(--mantine-color-teal-text)" />
                </ActionIcon>
              </ActionIcon.Group>
            </Group>
          </Grid.Col>
          <Grid.Col span={6}>
            {isFetching ? (
              <Center>
                <Loader size="sm" color="var(--mantine-color-teal-text)" />
              </Center>
            ) : (
              <Group gap="xs" justify="center">
                <PrevActionIcon onClick={() => handleNextAndPrev(-1)} />
                {viewMode === "day" ? (
                  <LocaleDatePickerInput
                    value={referenceDate}
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
                      locale === "de-DE" ? "DD. MMM YYYY" : "MMM DD, YYYY"
                    }
                    onChange={(value) => {
                      const [start, end] = value;
                      const s = start ? new Date(start) : null;
                      const e = end ? new Date(end) : null;
                      setRangeAndMaybeSwitch(s, e);
                    }}
                    presets={[
                      {
                        value: [
                          today.subtract(2, "day").format("YYYY-MM-DD"),
                          today.format("YYYY-MM-DD"),
                        ],
                        label:
                          locale === "de-DE" ? "Letzte 2 Tage" : "Last 2 days",
                      },
                      {
                        value: [
                          today.subtract(7, "day").format("YYYY-MM-DD"),
                          today.format("YYYY-MM-DD"),
                        ],
                        label:
                          locale === "de-DE" ? "Letzte 7 Tage" : "Last 7 days",
                      },
                      {
                        value: [
                          today
                            .startOf("week")
                            .add(1, "day")
                            .format("YYYY-MM-DD"),
                          today
                            .endOf("week")
                            .add(1, "day")
                            .format("YYYY-MM-DD"),
                        ],
                        label: locale === "de-DE" ? "Diese Woche" : "This week",
                      },
                      {
                        value: [
                          today
                            .startOf("week")
                            .subtract(1, "week")
                            .add(1, "day")
                            .format("YYYY-MM-DD"),
                          today
                            .endOf("week")
                            .subtract(1, "week")
                            .add(1, "day")
                            .format("YYYY-MM-DD"),
                        ],
                        label:
                          locale === "de-DE" ? "Letzte Woche" : "Last week",
                      },
                      {
                        value: [
                          today.startOf("month").format("YYYY-MM-DD"),
                          today.endOf("month").format("YYYY-MM-DD"),
                        ],
                        label:
                          locale === "de-DE" ? "Dieser Monat" : "This month",
                      },
                      {
                        value: [
                          today
                            .subtract(1, "month")
                            .startOf("month")
                            .format("YYYY-MM-DD"),
                          today
                            .subtract(1, "month")
                            .endOf("month")
                            .format("YYYY-MM-DD"),
                        ],
                        label:
                          locale === "de-DE" ? "Letzter Monat" : "Last month",
                      },
                    ]}
                  />
                )}
                <NextActionIcon onClick={() => handleNextAndPrev(1)} />
              </Group>
            )}
          </Grid.Col>
          <Grid.Col span={3} pr="md">
            <Group justify="flex-end" gap="xs" w="100%">
              <SegmentedControl
                color="teal"
                ml="md"
                value={viewMode}
                onChange={(v) => setViewMode(v as ViewMode)}
                data={[
                  { label: locale === "de-DE" ? "Tag" : "Day", value: "day" },
                  {
                    label: locale === "de-DE" ? "Woche" : "Week",
                    value: "week",
                  },
                ]}
              />
            </Group>
          </Grid.Col>
        </Grid>
        <CalendarGrid
          visibleProjects={visibleProjects}
          handleNextAndPrev={handleNextAndPrev}
          isFetching={isFetching}
          days={calendarDays}
          setReferenceDate={handleReferenceDateChange}
          handleSessionClick={handleSessionClick}
          hourMultiplier={zoomLevel[zoomIndex]}
          rasterHeight={rasterHeight}
        />
      </Stack>
      <CalendarLegend
        visibleProjects={visibleProjects}
        handleScrollToNow={handleScrollToNow}
      />
      {selectedSession && (
        <EditSessionDrawer
          timerSession={selectedSession}
          opened={drawerOpened}
          onClose={close}
        />
      )}
    </ScrollArea>
  );
}
