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

const headerGrid = (days: CalendarDay[]) => {
  return (
    <Grid
      columns={22}
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
      <Grid.Col span={1}>
       <ColumnHeader />
      </Grid.Col>
      {days.map((d) => {
        return (
          <Grid.Col
            span={3}
            key={`day-${getStartOfDay(d.day).toISOString().slice(0, 10)}`}
          >
            <ColumnHeader day={d.day} />
          </Grid.Col>
        );
      })}
    </Grid>
  );
};

export default function CalendarGrid({
  days,
  viewMode,
  projects,
  visibleProjects,
}: CalendarGridProps) {
  const header = headerGrid(days);
  return (
    <Stack h="100%" gap={0}>
      {header}
      <Grid columns={22} gutter={0} align="flex-end">
        <Grid.Col span={1}>
          <TimeColumn hourHeight={60} />
        </Grid.Col>
        {days.map((d) => {
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
  );
}
