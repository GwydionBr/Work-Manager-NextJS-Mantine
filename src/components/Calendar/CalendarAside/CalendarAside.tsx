"use client";

import { useGroupStore } from "@/stores/groupStore";

import CalendarAsideBig from "./CalendarAsideBig";
import CalendarAsideSmall from "./CalendarAsideSmall";
import { Tables } from "@/types/db.types";
import { useEffect, useState } from "react";
import { Box, Transition } from "@mantine/core";

export interface Appointment extends Tables<"group_appointment"> {
  profile: Tables<"profiles">;
}

interface CalendarAsideProps {
  isBig: boolean;
}

export default function CalendarAside({ isBig }: CalendarAsideProps) {
  const { selectedDate, activeGroupId } = useGroupStore();
  const activeGroup = useGroupStore((state) =>
    state.groups.find((g) => g.id === activeGroupId)
  );
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (activeGroup) {
      const appointments = activeGroup.appointments.filter((appointment) => {
        const appointmentDate = new Date(appointment.date);
        return (
          appointmentDate.getDate() === selectedDate?.getDate() &&
          appointmentDate.getMonth() === selectedDate?.getMonth() &&
          appointmentDate.getFullYear() === selectedDate?.getFullYear()
        );
      });
      const appointmentsWithProfile = appointments
        .map((appointment) => {
          const profile = activeGroup.members.find(
            (member) => member.id === appointment.user_id
          );
          return profile ? { ...appointment, profile } : null;
        })
        .filter(
          (appointment): appointment is NonNullable<typeof appointment> =>
            appointment !== null
        );
      setAppointments(appointmentsWithProfile);
    }
  }, [activeGroup, selectedDate]);

  return (
    <Box>
      <Transition
        mounted={isBig}
        transition="fade"
        duration={200}
        enterDelay={200}
      >
        {(styles) => (
          <div style={styles}>
            <CalendarAsideBig date={selectedDate} appointments={appointments} />
          </div>
        )}
      </Transition>
      <Transition
        mounted={!isBig}
        transition="fade"
        duration={200}
        enterDelay={200}
      >
        {(styles) => (
          <div style={styles}>
            <CalendarAsideSmall date={selectedDate} />
          </div>
        )}
      </Transition>
    </Box>
  );
}
