"use client";

import { useGroupStore } from "@/stores/groupStore";

import CalendarAsideBig from "./CalendarAsideBig";
import CalendarAsideSmall from "./CalendarAsideSmall";
import { Tables } from "@/types/db.types";
import { useEffect, useState } from "react";

export interface Appointment extends Tables<"group_appointment"> {
  profile: Tables<"profiles">;
}

interface CalendarAsideProps {
  isBig: boolean;
}

export default function CalendarAside({ isBig }: CalendarAsideProps) {
  const { selectedDate, activeGroup } = useGroupStore();
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

  return isBig ? (
    <CalendarAsideBig date={selectedDate} appointments={appointments} />
  ) : (
    <CalendarAsideSmall date={selectedDate} />
  );
}
