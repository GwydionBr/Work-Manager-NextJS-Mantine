"use client";

import { useGroupStore } from "@/stores/groupStore";

import { Badge } from "@mantine/core";
import classes from "./Calendar.module.css";
import { Tables } from "@/types/db.types";

interface CalendarEntryProps {
  appointment: Tables<"group_appointment">;
}

export default function CalendarEntry({ appointment }: CalendarEntryProps) {
  const { activeGroupId } = useGroupStore();
  const activeGroup = useGroupStore((state) =>
    state.groups.find((g) => g.id === activeGroupId)
  );
  const color = activeGroup?.members.find(
    (m) => m.id === appointment.user_id
  )?.color;
  return (
    <Badge
      autoContrast
      variant="outline"
      size="xs"
      radius="md"
      c={color ? "white" : "black"}
      bg={color || "#40c057"}
      fw={600}
    >
      {appointment.title}
    </Badge>
  );
}
