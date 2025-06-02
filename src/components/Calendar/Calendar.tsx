import { useState } from "react";
import { Paper } from "@mantine/core";
import { CalendarEntry } from "./types";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import classes from "./Calendar.module.css";

interface CalendarProps {
  entries?: CalendarEntry[];
  onDateSelect?: (date: Date) => void;
}

export default function Calendar({
  entries = [],
  onDateSelect,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
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
        entries={entries}
        onDateSelect={handleDateSelect}
      />
    </Paper>
  );
}
