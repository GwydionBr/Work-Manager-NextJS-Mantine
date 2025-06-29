"use client";

import { useGroupStore } from "@/stores/groupStore";

import { Card, ScrollArea, Stack, Text } from "@mantine/core";
import { Appointment } from "./CalendarAside";

import classes from "./ClalendarAside.module.css";

interface CalendarAsideBigProps {
  date: Date | null;
  appointments: Appointment[];
}

export default function CalendarAsideBig({
  date,
  appointments,
}: CalendarAsideBigProps) {
  const { activeGroupId } = useGroupStore();
  const activeGroup = useGroupStore((state) =>
    state.groups.find((g) => g.id === activeGroupId)
  );

  const renderAppointments = () => {
    if (appointments.length === 0) {
      return <Text>No appointments</Text>;
    }
    return appointments.map((appointment) => {
      const color = activeGroup?.members.find(
        (m) => m.id === appointment.user_id
      )?.color;
      return (
        <Stack
          key={appointment.id}
          className={classes.appointmentRow}
          style={{
            backgroundColor: color || "#40c057",
          }}
        >
          <Text size="xs" fw={700}>
            {appointment.title}
          </Text>
          {appointment.description && (
            <Text size="xs" c="white">
              {appointment.description}
            </Text>
          )}
          <Text size="xs" c="white">
            {appointment.profile.username}
          </Text>
        </Stack>
      );
    });
  };

  return (
    <Card shadow="sm" radius="md" p="md" withBorder w={270}>
      <ScrollArea h={250} type="scroll">
        <Stack>
          <Text size="lg" fw={700}>
            {date?.toLocaleDateString()}
          </Text>
          {renderAppointments()}
        </Stack>
      </ScrollArea>
    </Card>
  );
}
