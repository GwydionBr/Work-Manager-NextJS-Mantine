import { Text } from "@mantine/core";
import classes from "./Calendar.module.css";

interface CalendarEntryProps {
  id: string;
  title: string;
  color?: string;
}

export default function CalendarEntry({
  id,
  title,
  color,
}: CalendarEntryProps) {
  return (
    <Text
      className={classes.calendarEntry}
      style={{
        backgroundColor: color || undefined,
      }}
    >
      {title}
    </Text>
  );
}
