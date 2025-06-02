import { Box, Stack, Text } from "@mantine/core";
import { CalendarEntry as CalendarEntryType } from "./types";
import CalendarEntry from "./CalendarEntry";
import classes from "./Calendar.module.css";

interface CalendarCellProps {
  day: number;
  date: Date;
  entries: CalendarEntryType[];
  isSelected: boolean;
  isToday: boolean;
  isOtherMonth?: boolean;
  onSelect: (date: Date) => void;
}

export default function CalendarCell({
  day,
  date,
  entries,
  isSelected,
  isToday,
  isOtherMonth = false,
  onSelect,
}: CalendarCellProps) {
  return (
    <Box
      className={`${classes.calendarCell} ${
        isSelected ? classes.calendarCellSelected : ""
      } ${isToday ? classes.calendarCellToday : ""} ${
        isOtherMonth ? classes.calendarCellOtherMonth : ""
      }`}
      onClick={() => onSelect(date)}
    >
      <Text
        className={`${classes.calendarDayNumber} ${
          isToday
            ? classes.calendarDayNumberToday
            : classes.calendarDayNumberNormal
        }`}
      >
        {day}
      </Text>
      <Stack gap={2}>
        {entries.map((entry) => (
          <CalendarEntry
            key={entry.id}
            id={entry.id}
            title={entry.title}
            color={entry.color}
          />
        ))}
      </Stack>
    </Box>
  );
}
