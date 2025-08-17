"use client";

import { Grid, Stack } from "@mantine/core";
import { DayColumn } from "../DayColumn";
import { CalendarDay, ViewMode } from "@/types/workCalendar.types";
import { getStartOfDay } from "../calendarUtils";
import { TimeColumn } from "../TimeColumn";
import ColumnHeader from "./ColumnHeader";

interface CalendarGridProps {
  days: CalendarDay[];
  viewMode: ViewMode;
  setReferenceDate: (date: Date) => void;
  projects: { id: string; title: string }[];
  visibleProjects: {
    id: string;
    title: string;
    colors: {
      rail: string;
      border: string;
      fill: string;
    };
  }[];
}
export default function CalendarGrid({
  days,
  viewMode,
  setReferenceDate,
  projects,
  visibleProjects,
}: CalendarGridProps) {
  return (
    <Stack h="100%" gap={10}>
      <Grid
      columns={440}
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
      <Grid.Col span={20}>
       <ColumnHeader />
      </Grid.Col>
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
      <Grid columns={440} gutter={0} align="flex-end">
        <Grid.Col span={20}>
          <TimeColumn hourHeight={60} />
        </Grid.Col>
        {days.map((d) => {
          return (
            <Grid.Col
              span={Math.floor(420 / days.length)}
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
  );
}
