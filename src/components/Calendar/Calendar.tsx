import { useState } from "react";
import {
  Box,
  Paper,
  Text,
  Group,
  Button,
  Stack,
  useMantineTheme,
  useMantineColorScheme,
} from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import dayjs from "dayjs";
import "dayjs/locale/en";

dayjs.locale("en");

interface CalendarEntry {
  id: string;
  title: string;
  date: Date;
  color?: string;
}

interface CalendarProps {
  entries?: CalendarEntry[];
  onDateSelect?: (date: Date) => void;
}

export default function Calendar({
  entries = [],
  onDateSelect,
}: CalendarProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

  const getEntriesForDate = (day: number) => {
    return entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return (
        entryDate.getDate() === day &&
        entryDate.getMonth() === currentDate.getMonth() &&
        entryDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const renderCalendarGrid = () => {
    const days = [];
    const weekDays = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

    // Add weekday headers
    for (let i = 0; i < 7; i++) {
      days.push(
        <Box
          key={`header-${i}`}
          style={{
            padding: "8px",
            textAlign: "center",
            fontWeight: "bold",
            backgroundColor:
              colorScheme === "dark"
                ? theme.colors.dark[6]
                : theme.colors.gray[0],
            color:
              colorScheme === "dark"
                ? theme.colors.dark[0]
                : theme.colors.gray[7],
          }}
        >
          {weekDays[i]}
        </Box>
      );
    }

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <Box
          key={`empty-${i}`}
          style={{
            height: "100px",
            border: `1px solid ${colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]}`,
            backgroundColor:
              colorScheme === "dark"
                ? theme.colors.dark[6]
                : theme.colors.gray[0],
          }}
        />
      );
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateEntries = getEntriesForDate(day);
      const isSelected = selectedDate && selectedDate.getDate() === day;
      const isToday =
        new Date().getDate() === day &&
        new Date().getMonth() === currentDate.getMonth() &&
        new Date().getFullYear() === currentDate.getFullYear();

      days.push(
        <Box
          key={`day-${day}`}
          onClick={() => {
            const newDate = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              day
            );
            setSelectedDate(newDate);
            onDateSelect?.(newDate);
          }}
          style={{
            height: "100px",
            border: `1px solid ${colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]}`,
            padding: "4px",
            cursor: "pointer",
            backgroundColor: isSelected
              ? colorScheme === "dark"
                ? theme.colors.blue[9]
                : theme.colors.blue[0]
              : isToday
                ? colorScheme === "dark"
                  ? theme.colors.yellow[9]
                  : theme.colors.yellow[0]
                : colorScheme === "dark"
                  ? theme.colors.dark[7]
                  : theme.white,
            "&:hover": {
              backgroundColor:
                colorScheme === "dark"
                  ? theme.colors.dark[5]
                  : theme.colors.gray[0],
            },
          }}
        >
          <Text
            size="sm"
            fw={500}
            c={
              isToday
                ? colorScheme === "dark"
                  ? theme.colors.blue[4]
                  : theme.colors.blue[6]
                : colorScheme === "dark"
                  ? theme.colors.dark[0]
                  : theme.colors.gray[7]
            }
          >
            {day}
          </Text>
          <Stack gap={2}>
            {dateEntries.map((entry) => (
              <Text
                key={entry.id}
                size="xs"
                style={{
                  backgroundColor:
                    entry.color ||
                    theme.colors.blue[colorScheme === "dark" ? 7 : 6],
                  color: theme.white,
                  padding: "2px 4px",
                  borderRadius: "4px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {entry.title}
              </Text>
            ))}
          </Stack>
        </Box>
      );
    }

    return days;
  };

  return (
    <Paper
      shadow="sm"
      p="md"
      withBorder
      style={{
        backgroundColor:
          colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
      }}
    >
      <Group justify="space-between" mb="md">
        <Group>
          <Button
            variant="subtle"
            onClick={handlePreviousMonth}
            leftSection={<IconChevronLeft size={16} />}
          >
            Previous Month
          </Button>
          <Text
            fw={500}
            size="lg"
            c={
              colorScheme === "dark"
                ? theme.colors.dark[0]
                : theme.colors.gray[7]
            }
          >
            {dayjs(currentDate).format("MMMM YYYY")}
          </Text>
          <Button
            variant="subtle"
            onClick={handleNextMonth}
            rightSection={<IconChevronRight size={16} />}
          >
            Next Month
          </Button>
        </Group>
      </Group>
      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "1px",
          backgroundColor:
            colorScheme === "dark"
              ? theme.colors.dark[4]
              : theme.colors.gray[3],
        }}
      >
        {renderCalendarGrid()}
      </Box>
    </Paper>
  );
}
