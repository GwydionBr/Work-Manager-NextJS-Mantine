"use client";

import { useMemo } from "react";
import { useForm } from "@mantine/form";
import { useWorkStore } from "@/stores/workManagerStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Select, Stack, Textarea, TextInput } from "@mantine/core";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";

import { Tables, TablesInsert } from "@/types/db.types";
import UpdateButton from "@/components/UI/Buttons/UpdateButton";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import LocaleDateTimePicker from "../UI/Locale/LocaleDateTimePicker";

interface AppointmentFormProps {
  initialValues: TablesInsert<"appointment">;
  onSubmit: (values: TablesInsert<"appointment">) => void;
  onCancel: () => void;
  newAppointment: boolean;
  project?: Tables<"timer_project">;
  submitting?: boolean;
}

export default function AppointmentForm({
  initialValues,
  onSubmit,
  onCancel,
  newAppointment,
  project,
  submitting,
}: AppointmentFormProps) {
  const { locale } = useSettingsStore();
  const { projects: timerProjects } = useWorkStore();
  // Create conditional schema based on hourly_payment
  const schema = z.object({
    timer_project_id: z.string().nullable().optional(),
    title: z.string().min(1, { message: "Title is required" }),
    start_date: z.string().transform((str) => new Date(str).toISOString()),
    end_date: z.string().transform((str) => new Date(str).toISOString()),
    description: z.string().optional(),
  });

  const form = useForm<TablesInsert<"appointment">>({
    initialValues: {
      ...initialValues,
      timer_project_id:
        initialValues.timer_project_id || project?.id || undefined,
    },
    validate: zodResolver(schema),
  });

  const projects = useMemo(() => {
    return (
      timerProjects.map((timerProject) => ({
        value: timerProject.project.id,
        label: timerProject.project.title,
      })) || []
    );
  }, [timerProjects]);

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="lg">
        <Select
          allowDeselect={false}
          label={locale === "de-DE" ? "Projekt" : "Project"}
          value={form.values.timer_project_id}
          error={form.errors.timer_project_id}
          placeholder={
            locale === "de-DE" ? "Projekt auswählen" : "Select project"
          }
          data={projects}
          searchable
        />
        <TextInput
          label={locale === "de-DE" ? "Titel" : "Title"}
          placeholder={locale === "de-DE" ? "Titel eingeben" : "Title"}
          withAsterisk
          error={form.errors.title}
          data-autofocus
          {...form.getInputProps("title")}
        />
        <LocaleDateTimePicker
          withAsterisk
          label={locale === "de-DE" ? "Startzeit" : "Start Time"}
          value={form.values.start_date}
          error={form.errors.start_date}
        />
        <LocaleDateTimePicker
          withAsterisk
          label={locale === "de-DE" ? "Endzeit" : "End Time"}
          value={form.values.end_date}
          error={form.errors.end_date}
        />
        <Textarea
          label={locale === "de-DE" ? "Beschreibung" : "Description"}
          placeholder={
            locale === "de-DE" ? "Beschreibung eingeben" : "Description"
          }
          {...form.getInputProps("description")}
        />
        {newAppointment ? (
          <CreateButton
            onClick={form.onSubmit(onSubmit)}
            type="submit"
            loading={submitting}
            mt="md"
            title={
              locale === "de-DE" ? "Termin erstellen" : "Create Appointment"
            }
          />
        ) : (
          <UpdateButton
            onClick={form.onSubmit(onSubmit)}
            type="submit"
            loading={submitting}
            mt="md"
            title={
              locale === "de-DE" ? "Termin aktualisieren" : "Update Appointment"
            }
          />
        )}
        {onCancel && <CancelButton onClick={onCancel} />}
      </Stack>
    </form>
  );
}
