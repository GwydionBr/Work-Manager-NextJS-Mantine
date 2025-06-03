"use client";

import { useForm } from "@mantine/form";
import { useState } from "react";
import { useGroupStore } from "@/stores/groupStore";
import { useUserStore } from "@/stores/userStore";

import { TextInput, Stack, Button, Alert, Select } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";

import { Tables } from "@/types/db.types";

const schema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  date: z.string().transform((str) => new Date(str)),
  reminder: z
    .string()
    .nullable()
    .transform((str) => (str ? new Date(str) : null)),
  userId: z.string().min(1, "Please select a responsible person"),
});

interface AppointmentFormProps {
  onClose: () => void;
  appointment?: Tables<"group_appointment"> | null;
  groupId: string;
}

export default function AppointmentForm({
  onClose,
  appointment,
  groupId,
}: AppointmentFormProps) {
  const { activeGroup, addAppointment, updateAppointment } = useGroupStore();
  const { profile } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      title: appointment?.title || "",
      description: appointment?.description || "",
      date: appointment?.date
        ? new Date(appointment.date).toISOString()
        : new Date().toISOString(),
      reminder: appointment?.reminder
        ? new Date(appointment.reminder).toISOString()
        : null,
      userId: appointment?.user_id || profile?.id || "",
    },
    validate: zodResolver(schema),
  });

  async function handleFormSubmit(values: {
    title: string;
    description: string;
    date: string;
    reminder: string | null;
    userId: string;
  }) {
    setIsLoading(true);
    setError(null);
    if (!appointment) {
      const response = await addAppointment({
        title: values.title,
        description: values.description,
        date: values.date,
        reminder: values.reminder,
        user_id: values.userId,
        group_id: groupId,
      });
      if (response) {
        onClose();
      } else {
        setError("Failed to save appointment. Please try again.");
      }
    } else {
      const response = await updateAppointment({
        id: appointment.id,
        title: values.title,
        description: values.description,
        date: values.date,
        reminder: values.reminder,
        user_id: values.userId,
      });
      if (response) {
        onClose();
      } else {
        setError("Failed to update appointment. Please try again.");
      }
    }
    setIsLoading(false);
  }

  const groupMembers = activeGroup
    ? activeGroup.members.map((member) => ({
        value: member.id,
        label: member.username,
      }))
    : [];

  return (
    <form onSubmit={form.onSubmit(handleFormSubmit)}>
      <Stack>
        <TextInput
          withAsterisk
          label="Title"
          {...form.getInputProps("title")}
          data-autofocus
        />
        <TextInput label="Description" {...form.getInputProps("description")} />
        <DateTimePicker
          withAsterisk
          label="Date and Time"
          placeholder="Pick date and time"
          {...form.getInputProps("date")}
        />
        <DateTimePicker
          label="Reminder"
          placeholder="Set reminder (optional)"
          clearable
          {...form.getInputProps("reminder")}
        />
        <Select
          withAsterisk
          label="Responsible Person"
          placeholder="Select a responsible person"
          data={groupMembers}
          {...form.getInputProps("userId")}
        />
        <Button type="submit" loading={isLoading} mt="md">
          {appointment ? "Update" : "Create"}
        </Button>
        {error && (
          <Alert variant="light" color="red">
            {error}
          </Alert>
        )}
      </Stack>
    </form>
  );
}
