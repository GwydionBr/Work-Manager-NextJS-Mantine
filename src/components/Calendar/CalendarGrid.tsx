"use client";

import { useCalendarStore } from "@/stores/calendarStore";

import { Box, Stack } from "@mantine/core";
import CalendarCell from "./CalendarCell";

import { Tables } from "@/types/db.types";

import classes from "./Calendar.module.css";

interface CalendarGridProps {
  currentDate: Date;
  selectedDate: Date | null;
  entries: Tables<"group_appointment">[];
  onDateSelect: (date: Date) => void;
}

export default function CalendarGrid({
  currentDate,
  selectedDate, 
  entries,
  onDateSelect,
}: CalendarGridProps) {
  const { viewMode } = useCalendarStore();
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  // Adjust firstDayOfMonth to start from Monday (1) instead of Sunday (0)
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const getEntriesForDate = (date: Date) => {
    return entries.filter((entry) => {
      const entryDate = new Date(entry.start_date);
      return (
        entryDate.getDate() === date.getDate() &&
        entryDate.getMonth() === date.getMonth() &&
        entryDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const renderWeekDayHeader = () => {
    const weekDays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
    const weekDayHeaders = [];
    for (let i = 0; i < 7; i++) {
      weekDayHeaders.push(
        <Box key={`header-${i}`} className={classes.weekdayHeader}>
          {weekDays[i]}
        </Box>
      );
    }
    return weekDayHeaders;
  };

  const renderCalendarGrid = () => {
    const days = [];

    // Calculate days from previous month
    const prevMonthDays = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0
    ).getDate();

    // Add days from previous month
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        day
      );
      const dateEntries = getEntriesForDate(date);
      const isSelected =
        selectedDate &&
        selectedDate.getDate() === date.getDate() &&
        selectedDate.getMonth() === date.getMonth() &&
        selectedDate.getFullYear() === date.getFullYear();
      const isToday =
        new Date().getDate() === date.getDate() &&
        new Date().getMonth() === date.getMonth() &&
        new Date().getFullYear() === date.getFullYear();

      days.push(
        <CalendarCell
          key={`prev-${day}`}
          day={day}
          date={date}
          entries={dateEntries}
          isSelected={isSelected ?? false}
          isToday={isToday}
          isOtherMonth={true}
          onSelect={onDateSelect}
        />
      );
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const dateEntries = getEntriesForDate(date);
      const isSelected =
        selectedDate &&
        selectedDate.getDate() === date.getDate() &&
        selectedDate.getMonth() === date.getMonth() &&
        selectedDate.getFullYear() === date.getFullYear();
      const isToday =
        new Date().getDate() === date.getDate() &&
        new Date().getMonth() === date.getMonth() &&
        new Date().getFullYear() === date.getFullYear();

      days.push(
        <CalendarCell
          key={`day-${day}`}
          day={day}
          date={date}
          entries={dateEntries}
          isSelected={isSelected ?? false}
          isToday={isToday}
          onSelect={onDateSelect}
        />
      );
    }

    // Calculate if we need a 6th row
    const totalDays = adjustedFirstDay + daysInMonth;
    const needsSixthRow = totalDays > 35; // If we have more than 5 rows (35 days)
    const remainingCells = needsSixthRow ? 42 - totalDays : 35 - totalDays;

    // Add days from next month only if needed
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        day
      );
      const dateEntries = getEntriesForDate(date);
      const isSelected =
        selectedDate &&
        selectedDate.getDate() === date.getDate() &&
        selectedDate.getMonth() === date.getMonth() &&
        selectedDate.getFullYear() === date.getFullYear();
      const isToday =
        new Date().getDate() === date.getDate() &&
        new Date().getMonth() === date.getMonth() &&
        new Date().getFullYear() === date.getFullYear();

      days.push(
        <CalendarCell
          key={`next-${day}`}
          day={day}
          date={date}
          entries={dateEntries}
          isSelected={isSelected ?? false}
          isToday={isToday}
          isOtherMonth={true}
          onSelect={onDateSelect}
        />
      );
    }

    return days;
  };

  return (
    <Stack h="100%" gap={0}>
      <Box className={classes.calendarGridWeekDayHeader}>
        {renderWeekDayHeader()}
      </Box>
      <Box className={classes.calendarGrid}>{renderCalendarGrid()}</Box>
    </Stack>
  );
}
