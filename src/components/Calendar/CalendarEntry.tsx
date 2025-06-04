"use client";

import { useGroupStore } from "@/stores/groupStore";

import { Text } from "@mantine/core";
import classes from "./Calendar.module.css";
import { Tables } from "@/types/db.types";

interface CalendarEntryProps {
  appointment: Tables<"group_appointment">;
}

export default function CalendarEntry({
  appointment,
}: CalendarEntryProps) {
  const { activeGroupId } = useGroupStore();
  const activeGroup = useGroupStore((state) =>
    state.groups.find((g) => g.id === activeGroupId)
  );
  const color = activeGroup?.members.find(
    (m) => m.id === appointment.user_id
  )?.color;
  return (
    <Text
      className={classes.calendarEntry}
      style={{
        backgroundColor: color || "#40c057",
      }}
    >
      {appointment.title}
    </Text>
  );
}
