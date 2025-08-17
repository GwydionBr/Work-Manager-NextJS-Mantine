import { Grid } from "@mantine/core";
import { DayColumn } from "../DayColumn";
import { ViewMode } from "@/types/workCalendar.types";
import { Tables } from "@/types/db.types";
import { getStartOfDay } from "../calendarUtils";
import { TimeColumn } from "../TimeColumn";

interface CalendarGridProps {
  days: Date[];
  viewMode: ViewMode;
  items: Tables<"timer_session">[];
  hourHeight: number;
  timelineStartHour: number;
  timelineEndHour: number;
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
  items,
  hourHeight,
  timelineStartHour,
  timelineEndHour,
  projects,
  visibleProjects,
}: CalendarGridProps) {
  return (
    <Grid columns={22} gutter={0}>
      <Grid.Col span={1}>
        <TimeColumn
          hourHeight={hourHeight}
          startHour={timelineStartHour}
          endHour={timelineEndHour}
        />
      </Grid.Col>
      {days.map((d) => (
        <Grid.Col
          span={3}
          key={`day-${getStartOfDay(d).toISOString().slice(0, 10)}`}
        >
          <DayColumn
            viewMode={viewMode}
            day={d}
            sessions={items}
            startHour={timelineStartHour}
            endHour={timelineEndHour}
            projects={projects.map((p) => ({ id: p.id, title: p.title }))}
            visibleProjects={visibleProjects}
          />
        </Grid.Col>
      ))}
    </Grid>
  );
}
