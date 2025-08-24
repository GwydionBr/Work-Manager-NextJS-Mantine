"use client";

import { useEffect, useState } from "react";
import { useMouse, useDisclosure } from "@mantine/hooks";
import { useWorkStore } from "@/stores/workManagerStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Grid, Stack, Group, Box, Modal } from "@mantine/core";
import { DayColumn } from "@/components/WorkCalendar/DayColumn";
import { TimeColumn } from "@/components/WorkCalendar/TimeColumn";
import ColumnHeader from "@/components/WorkCalendar/Calendar/ColumnHeader";
import SessionForm from "@/components/Work/Session/SessionForm";
import { clamp } from "@/components/WorkCalendar/calendarUtils";

import {
  getStartOfDay,
  isToday,
} from "@/components/WorkCalendar/calendarUtils";

import { Currency } from "@/types/settings.types";
import { CalendarDay, VisibleProject } from "@/types/workCalendar.types";
import { TablesInsert } from "@/types/db.types";
import PrevActionIcon from "@/components/UI/ActionIcons/PrevActionIcon";
import NextActionIcon from "@/components/UI/ActionIcons/NextActionIcon";

interface CalendarGridProps {
  days: CalendarDay[];
  isFetching: boolean;
  hourMultiplier: number;
  rasterHeight: number;
  setReferenceDate: (date: Date) => void;
  handleSessionClick: (sessionId: string) => void;
  handleNextAndPrev: (direction: number) => void;
  visibleProjects: VisibleProject[];
}
export default function CalendarGrid({
  days,
  isFetching,
  hourMultiplier,
  rasterHeight,
  setReferenceDate,
  handleSessionClick,
  handleNextAndPrev,
  visibleProjects,
}: CalendarGridProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [startNewSession, setStartNewSession] = useState<number | null>(null);
  const [newSessionDay, setNewSessionDay] = useState<Date | null>(null);
  const [modalOpened, { open, close }] = useDisclosure(false);
  const [submitting, setSubmitting] = useState(false);
  const { addTimerSession } = useWorkStore();
  const {
    defaultSalaryCurrency,
    defaultSalaryAmount,
    defaultProjectHourlyPayment,
  } = useSettingsStore();

  const { ref, x, y } = useMouse();
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  function handleClick() {
    if (newSessionDay && startNewSession) {
      open();
      return;
    }
  }

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

  const yToTime = (y: number, day: Date) => {
    const minutes = (y / (rasterHeight * hourMultiplier)) * 60;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      hours,
      remainingMinutes
    );
  };

  async function handleSubmit(values: {
    project_id?: string;
    start_time: string;
    end_time: string;
    active_seconds: number;
    paused_seconds: number;
    currency: Currency;
    salary: number;
    memo?: string;
  }) {
    setSubmitting(true);

    if (!values.project_id) {
      setSubmitting(false);
      return;
    }

    const newSession: TablesInsert<"timer_session"> = {
      ...values,
      start_time: new Date(values.start_time).toISOString(),
      end_time: new Date(values.end_time).toISOString(),
      true_end_time: new Date(values.end_time).toISOString(),
      memo: values.memo || null,
    };

    const success = await addTimerSession(newSession);
    if (success) {
      close();
      setStartNewSession(null);
      setNewSessionDay(null);
    }
    setSubmitting(false);
  }

  return (
    <Box w="100%">
      <Stack w="100%">
        {/* Header */}
        <Group
          gap={0}
          wrap="nowrap"
          w="100%"
          bg="var(--mantine-color-body)"
          style={{
            position: "sticky",
            top: 60,
            zIndex: 20,
            borderBottom:
              "2px solid light-dark(var(--mantine-color-gray-6), var(--mantine-color-dark-2))",
          }}
        >
          <Box w={42}>
            <ColumnHeader
              icon={<PrevActionIcon onClick={() => handleNextAndPrev(-1)} />}
              visibleProjects={visibleProjects}
            />
          </Box>
          <Grid
            w="100%"
            columns={420}
            gutter={0}
            align="flex-end"
            style={{
              position: "sticky",
              top: 60,
              zIndex: 20,
              background: "var(--mantine-color-body)",
            }}
          >
            {days.map((d) => {
              return (
                <Grid.Col
                  span={Math.floor(420 / days.length)}
                  key={`day-${getStartOfDay(d.day).toISOString().slice(0, 10)}`}
                >
                  <ColumnHeader
                    day={d}
                    setReferenceDate={setReferenceDate}
                    visibleProjects={visibleProjects}
                  />
                </Grid.Col>
              );
            })}
          </Grid>
          <Box w={42}>
            <ColumnHeader
              icon={<NextActionIcon onClick={() => handleNextAndPrev(1)} />}
              visibleProjects={visibleProjects}
            />
          </Box>
        </Group>
        {/* Body */}
        <Group gap={0} wrap="nowrap" align="flex-start">
          <Stack w={42} align="center">
            <TimeColumn
              hourHeight={rasterHeight}
              hourMultiplier={hourMultiplier}
            />
          </Stack>
          <Stack h="100%" gap={10} w="100%">
            <Grid
              columns={420}
              gutter={0}
              align="flex-end"
              ref={ref}
              onClick={handleClick}
            >
              {days.map((d) => {
                return (
                  <Grid.Col
                    span={Math.floor(420 / days.length)}
                    key={`day-${getStartOfDay(d.day).toISOString().slice(0, 10)}`}
                  >
                    <DayColumn
                      day={d.day}
                      y={y}
                      yToTime={yToTime}
                      toY={toY}
                      isFetching={isFetching}
                      currentTime={isToday(d.day) ? currentTime : undefined}
                      sessions={d.sessions}
                      handleSessionClick={handleSessionClick}
                      hourMultiplier={hourMultiplier}
                      rasterHeight={rasterHeight}
                      startNewSession={startNewSession}
                      setStartNewSession={setStartNewSession}
                      newSessionDay={newSessionDay}
                      setNewSessionDay={setNewSessionDay}
                    />
                  </Grid.Col>
                );
              })}
            </Grid>
          </Stack>
          <Stack w={42} align="center">
            <TimeColumn
              hourHeight={rasterHeight}
              hourMultiplier={hourMultiplier}
            />
          </Stack>
        </Group>
      </Stack>
      <Modal
        opened={modalOpened}
        onClose={() => {
          close();
          setStartNewSession(null);
          setNewSessionDay(null);
        }}
        title="Add Session"
        size="lg"
        padding="md"
      >
        {newSessionDay && startNewSession && (
          <SessionForm
            initialValues={{
              start_time: yToTime(
                Math.min(startNewSession, y),
                newSessionDay
              ).toISOString(),
              end_time: yToTime(
                Math.max(startNewSession, y),
                newSessionDay
              ).toISOString(),
              active_seconds:
                (new Date(
                  yToTime(Math.max(startNewSession, y), newSessionDay)
                ).getTime() -
                  new Date(
                    yToTime(Math.min(startNewSession, y), newSessionDay)
                  ).getTime()) /
                1000,
              paused_seconds: 0,
              currency: defaultSalaryCurrency,
              salary: defaultSalaryAmount,
              hourly_payment: defaultProjectHourlyPayment,
            }}
            onSubmit={handleSubmit}
            onCancel={() => {
              close();
              setStartNewSession(null);
              setNewSessionDay(null);
            }}
            newSession
            submitting={submitting}
          />
        )}
      </Modal>
    </Box>
  );
}
