"use client";

import { useState } from "react";
import { useGroupStore } from "@/stores/groupStore";

import { Paper } from "@mantine/core";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";

import { Tables } from "@/types/db.types";

import classes from "./Calendar.module.css";

interface CalendarProps {
  onDateSelect?: (date: Date) => void;
}

export default function Calendar({ onDateSelect }: CalendarProps) {
  const { activeGroup } = useGroupStore();
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
        entries={activeGroup?.appointments || []}
        onDateSelect={handleDateSelect}
      />
    </Paper>
  );
}
