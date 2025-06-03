"use client";

import { Card, Stack, Text } from "@mantine/core";

import { Appointment } from "./CalendarAside";

interface CalendarAsideBigProps {
  date: Date | null;
  appointments: Appointment[];
}

export default function CalendarAsideBig({
  date,
  appointments,
}: CalendarAsideBigProps) {
  const renderAppointments = () => {
    if (appointments.length === 0) {
      return <Text>Keine Termine</Text>;
    }
    return appointments.map((appointment) => (
      <Stack key={appointment.id}>
        <Text size="xs" fw={700}>
          {appointment.title}
        </Text>
        <Text size="xs" c="dimmed">
          {appointment.description}
        </Text>
        <Text size="xs" c="dimmed">
          {appointment.profile.username}
        </Text>
      </Stack>
    ));
  };

  return (
    <Card shadow="sm" radius="md" p="md" withBorder w={270}>
      <Stack>
        <Text size="lg" fw={700}>
          {date?.toLocaleDateString()}
        </Text>
        {renderAppointments()}
      </Stack>
    </Card>
  );
}
