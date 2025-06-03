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
        <Text>{appointment.title}</Text>
        <Text>{appointment.description}</Text>
        <Text>{appointment.profile.username}</Text>
      </Stack>
    ));
  };

  return (
    <Card shadow="sm" radius="md" p="md" withBorder>
      <Text>{date?.toLocaleDateString()}</Text>
      {renderAppointments()}
    </Card>
  );
}
