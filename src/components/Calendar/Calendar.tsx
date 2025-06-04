"use client";

import { useState } from "react";
import { useGroupStore } from "@/stores/groupStore";

import { Paper } from "@mantine/core";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";

import classes from "./Calendar.module.css";

export default function Calendar() {
  const { activeGroupId, selectedDate, setSelectedDate } = useGroupStore();
  const activeGroup = useGroupStore((state) =>
    state.groups.find((g) => g.id === activeGroupId)
  );
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  return (
    <Paper
      shadow="sm"
      radius="lg"
      pt="md"
      withBorder
      className={classes.calendarContainer}
    >
      <CalendarHeader
        currentDate={currentDate}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
      />
      <CalendarGrid
        currentDate={currentDate}
        selectedDate={selectedDate}
        entries={activeGroup?.appointments || []}
        onDateSelect={setSelectedDate}
      />
    </Paper>
  );
}
