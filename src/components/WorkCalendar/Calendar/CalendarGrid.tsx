"use client";

import { useEffect, useState } from "react";

import { Grid, Stack, Group } from "@mantine/core";
import { DayColumn } from "@/components/WorkCalendar/DayColumn";
import { TimeColumn } from "@/components/WorkCalendar/TimeColumn";
import ColumnHeader from "@/components/WorkCalendar/Calendar/ColumnHeader";

import {
  getStartOfDay,
  isToday,
} from "@/components/WorkCalendar/calendarUtils";

import { CalendarDay } from "@/types/workCalendar.types";

interface CalendarGridProps {
  days: CalendarDay[];
  isFetching: boolean;
  setReferenceDate: (date: Date) => void;
  handleSessionClick: (sessionId: string) => void;
}
export default function CalendarGrid({
  days,
  setReferenceDate,
  handleSessionClick,
  isFetching,
}: CalendarGridProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Group h="100%" gap={0} wrap="nowrap">
      <Stack w={56} align="flex-end">
        <ColumnHeader />
        <TimeColumn hourHeight={60} />
      </Stack>
      <Stack h="100%" gap={10} w="100%">
        <Grid
          columns={420}
          gutter={0}
          align="flex-end"
          style={{
            position: "sticky",
            top: 60,
            zIndex: 10,
            background: "var(--mantine-color-body)",
            borderBottom: "1px solid var(--mantine-color-gray-3)",
          }}
        >
          {days.map((d) => {
            return (
              <Grid.Col
                span={Math.floor(420 / days.length)}
                key={`day-${getStartOfDay(d.day).toISOString().slice(0, 10)}`}
              >
                <ColumnHeader day={d.day} setReferenceDate={setReferenceDate} />
              </Grid.Col>
            );
          })}
        </Grid>
        <Grid columns={420} gutter={0} align="flex-end">
          {days.map((d) => {
            return (
              <Grid.Col
                span={Math.floor(420 / days.length)}
                key={`day-${getStartOfDay(d.day).toISOString().slice(0, 10)}`}
              >
                <DayColumn
                  day={d.day}
                  isFetching={isFetching}
                  currentTime={isToday(d.day) ? currentTime : undefined}
                  sessions={d.sessions}
                  handleSessionClick={handleSessionClick}
                />
              </Grid.Col>
            );
          })}
        </Grid>
      </Stack>
    </Group>
  );
}
