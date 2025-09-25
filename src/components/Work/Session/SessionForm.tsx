"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "@mantine/form";
import { useWorkStore } from "@/stores/workManagerStore";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  NumberInput,
  Select,
  Stack,
  Textarea,
  Group,
  Button,
  Text,
  Collapse,
  Fieldset,
} from "@mantine/core";
import { IconPlayerPlay, IconPlus } from "@tabler/icons-react";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import { currencies } from "@/constants/settings";
import TimeInput from "@/components/Work/Session/SessionTimeInput";
import UpdateButton from "@/components/UI/Buttons/UpdateButton";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import LocaleDateTimePicker from "@/components/UI/Locale/LocaleDateTimePicker";

import { Tables } from "@/types/db.types";
import { NewSession } from "@/types/timerSession.types";

interface SessionFormProps {
  initialValues: NewSession;
  newSession: boolean;
  project?: Tables<"timer_project">;
  submitting?: boolean;
  onProjectChange?: (value: Tables<"timer_project">) => void;
  onSubmit: (values: NewSession) => void;
  onCancel: () => void;
  onOpenProjectForm?: () => void;
}

export default function SessionForm({
  initialValues,
  newSession,
  project,
  submitting,
  onSubmit,
  onCancel,
  onOpenProjectForm,
  onProjectChange,
}: SessionFormProps) {
  const { locale } = useSettingsStore();
  const { projects: timerProjects } = useWorkStore();
  const [userChangedStartTime, setUserChangedStartTime] = useState(false);
  const [userChangedEndTime, setUserChangedEndTime] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);

  const schema = z.object({
    project_id: z.string(),
    start_time: z.string().transform((str) => new Date(str).toISOString()),
    end_time: z.string().transform((str) => new Date(str).toISOString()),
    active_seconds: z.number().min(1, {
      message:
        locale === "de-DE"
          ? "Aktive Zeit muss größer als 0 sein"
          : "Active time must be greater than 0",
    }),
    memo: z.string().optional(),
    currency: z.string().min(1, {
      message:
        locale === "de-DE"
          ? "Währung ist erforderlich"
          : "Currency is required",
    }),
    salary: z.number().min(0, {
      message:
        locale === "de-DE"
          ? "Gehalt muss positiv sein"
          : "Salary must be positive",
    }),
  });

  const form = useForm<NewSession>({
    initialValues: {
      ...initialValues,
      project_id: initialValues.project_id || project?.id || undefined,
      start_time: (() => {
        const d = new Date(initialValues.start_time);
        d.setSeconds(0, 0);
        return d.toISOString();
      })(),
      end_time: (() => {
        const d = new Date(initialValues.end_time);
        d.setSeconds(0, 0);
        return d.toISOString();
      })(),
    },
    validate: zodResolver(schema),
  });

  // Initialize form - when form opens, adjust start_time based on active/paused time
  useEffect(() => {
    if (!formInitialized) {
      const totalSeconds = form.values.active_seconds;
      const endTime = new Date(form.values.end_time);
      const startTime = new Date(endTime.getTime() - totalSeconds * 1000);
      form.setFieldValue("start_time", startTime.toISOString());
      setFormInitialized(true);
    }
  }, [formInitialized, form]);

  useEffect(() => {
    if (project && project.id !== form.values.project_id) {
      form.setFieldValue("project_id", project.id);
      form.setFieldValue("currency", project.currency);
      form.setFieldValue("salary", project.salary);
    }
  }, [project]);

  const projects = useMemo(() => {
    return (
      timerProjects.map((timerProject) => ({
        value: timerProject.id,
        label: timerProject.title,
      })) || []
    );
  }, [timerProjects]);

  // Calculate end_time when active_seconds changes
  const handleActiveSecondsChange = (value: number) => {
    form.setFieldValue("active_seconds", value);

    const totalSeconds = value;

    // If both start and end time have been manually changed by user, keep start_time fixed
    if (userChangedStartTime) {
      const startTime = new Date(form.values.start_time);
      const endTime = new Date(startTime.getTime() + totalSeconds * 1000);
      form.setFieldValue("end_time", endTime.toISOString());
    } else {
      // Otherwise, adjust start_time based on end_time (initial behavior)
      const endTime = new Date(form.values.end_time);
      const startTime = new Date(endTime.getTime() - totalSeconds * 1000);
      form.setFieldValue("start_time", startTime.toISOString());
    }
  };

  // Calculate active_seconds when end_time changes (rounded to nearest minute)
  const handleEndTimeChange = (value: string | null) => {
    if (!value) return;
    setUserChangedEndTime(true);

    form.setFieldValue("end_time", value);

    const startTime = new Date(form.values.start_time);
    const endTime = new Date(value);
    const totalSeconds = Math.floor(
      (endTime.getTime() - startTime.getTime()) / 1000
    );

    if (totalSeconds > 0) {
      // Calculate active seconds by subtracting paused seconds
      const activeSeconds = totalSeconds;

      if (activeSeconds > 0) {
        // Round to nearest minute (60 seconds)
        const roundedSeconds = Math.round(activeSeconds / 60) * 60;
        form.setFieldValue("active_seconds", roundedSeconds);

        // Update end_time to match the rounded active seconds + paused seconds
        const newTotalSeconds = roundedSeconds;
        const newEndTime = new Date(
          startTime.getTime() + newTotalSeconds * 1000
        );
        form.setFieldValue("end_time", newEndTime.toISOString());
      }
    }
  };

  // Handle start_time changes and update end_time/active_seconds accordingly
  const handleStartTimeChange = (value: string | null) => {
    if (!value) return;
    setUserChangedStartTime(true);

    form.setFieldValue("start_time", value);

    const startTime = new Date(value);
    const endTime = new Date(form.values.end_time);
    const totalSeconds = Math.floor(
      (endTime.getTime() - startTime.getTime()) / 1000
    );

    if (totalSeconds > 0) {
      // Calculate active seconds by subtracting paused seconds
      const activeSeconds = totalSeconds;

      if (activeSeconds > 0) {
        // Round to nearest minute
        const roundedSeconds = Math.round(activeSeconds / 60) * 60;
        form.setFieldValue("active_seconds", roundedSeconds);

        // Update end_time to match the rounded active seconds + paused seconds
        const newTotalSeconds = roundedSeconds;
        const newEndTime = new Date(
          startTime.getTime() + newTotalSeconds * 1000
        );
        form.setFieldValue("end_time", newEndTime.toISOString());
      }
    }
  };

  function handleProjectChange(value: string | null) {
    if (!value) return;
    const project = timerProjects.find((p) => p.id === value);
    if (project) {
      if (onProjectChange) {
        onProjectChange(project);
      }
    }
  }

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack>
        <Fieldset legend={locale === "de-DE" ? "Projekt" : "Project"}>
          <Group wrap="nowrap">
            <Select
              w="100%"
              withAsterisk
              allowDeselect={false}
              label={locale === "de-DE" ? "Projekt" : "Project"}
              value={form.values.project_id}
              error={form.errors.project_id}
              placeholder={
                locale === "de-DE" ? "Projekt auswählen" : "Select project"
              }
              data={projects}
              searchable
              onChange={handleProjectChange}
            />
            <Button
              onClick={onOpenProjectForm}
              leftSection={<IconPlus size={18} />}
              fw={500}
              variant="subtle"
              w={150}
              mt={25}
              p={0}
            >
              <Text fz="xs" c="dimmed">
                {locale === "de-DE" ? "Neues Projekt" : "Add Project"}
              </Text>
            </Button>
          </Group>
        </Fieldset>
        <Fieldset legend={locale === "de-DE" ? "Zeit" : "Time"}>
          <Stack>
            <TimeInput
              label={locale === "de-DE" ? "Aktive Zeit" : "Active Time"}
              value={form.values.active_seconds}
              onChange={handleActiveSecondsChange}
              error={form.errors.active_seconds}
              icon={<IconPlayerPlay size={18} />}
              color="green"
              data-autofocus={true}
              isOpen={true}
            />
            <Group grow>
              <LocaleDateTimePicker
                withAsterisk
                label={locale === "de-DE" ? "Startzeit" : "Start Time"}
                value={form.values.start_time}
                onChange={handleStartTimeChange}
                error={form.errors.start_time}
              />
              <LocaleDateTimePicker
                withAsterisk
                label={locale === "de-DE" ? "Endzeit" : "End Time"}
                value={form.values.end_time}
                onChange={handleEndTimeChange}
                error={form.errors.end_time}
              />
            </Group>
          </Stack>
        </Fieldset>
        <Fieldset legend={locale === "de-DE" ? "Finanzen" : "Finances"}>
          <Collapse in={project?.hourly_payment !== false}>
            <NumberInput
              label={locale === "de-DE" ? "Gehalt" : "Salary"}
              min={0}
              step={0.01}
              {...form.getInputProps("salary")}
            />
            <Select
              label={locale === "de-DE" ? "Währung" : "Currency"}
              placeholder={
                locale === "de-DE" ? "Währung auswählen" : "Select currency"
              }
              data={currencies}
              {...form.getInputProps("currency")}
            />
          </Collapse>
          <Collapse in={project?.hourly_payment === false}>
            <Text>Hobby</Text>
          </Collapse>
        </Fieldset>
        <Textarea
          label={locale === "de-DE" ? "Notiz" : "Memo"}
          placeholder={locale === "de-DE" ? "Notiz eingeben" : "Memo"}
          {...form.getInputProps("memo")}
        />
        {newSession ? (
          <CreateButton
            onClick={form.onSubmit(onSubmit)}
            type="submit"
            loading={submitting}
            mt="md"
          />
        ) : (
          <UpdateButton
            onClick={form.onSubmit(onSubmit)}
            type="submit"
            loading={submitting}
            mt="md"
          />
        )}
      </Stack>
    </form>
  );
}
