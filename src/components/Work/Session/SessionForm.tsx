"use client";

import { useState, useEffect, useMemo } from "react";
import { useWorkStore } from "@/stores/workManagerStore";
import { useForm } from "@mantine/form";

import { NumberInput, Select, Stack, Textarea } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { IconPlayerPlay, IconPlayerPause } from "@tabler/icons-react";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import { currencies } from "@/constants/settings";
import TimeInput from "@/components/Work/Session/SessionTimeInput";

import { Currency } from "@/types/settings.types";
import { Tables } from "@/types/db.types";
import UpdateButton from "@/components/UI/Buttons/UpdateButton";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import CancelButton from "@/components/UI/Buttons/CancelButton";

interface NewSession {
  project_id?: string;
  start_time: string;
  end_time: string;
  active_seconds: number;
  paused_seconds: number;
  currency: Currency;
  salary: number;
  memo?: string;
  [key: string]: unknown;
}

interface SessionFormProps {
  initialValues: NewSession;
  onSubmit: (values: NewSession) => void;
  onCancel: () => void;
  newSession: boolean;
  project?: Tables<"timer_project">;
  submitting?: boolean;
}

export default function SessionForm({
  initialValues,
  onSubmit,
  onCancel,
  newSession,
  project,
  submitting,
}: SessionFormProps) {
  const { projects: timerProjects } = useWorkStore();
  const [userChangedStartTime, setUserChangedStartTime] = useState(false);
  const [userChangedEndTime, setUserChangedEndTime] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);
  const [showPaymentFields, setShowPaymentFields] = useState(false);
  // Create conditional schema based on hourly_payment
  const schema = z.object({
    project_id: z.string(),
    start_time: z.string().transform((str) => new Date(str).toISOString()),
    end_time: z.string().transform((str) => new Date(str).toISOString()),
    active_seconds: z
      .number()
      .min(1, { message: "Active time must be greater than 0" }),
    paused_seconds: z
      .number()
      .min(0, { message: "Paused time must be positive or 0" }),
    memo: z.string().optional(),
    currency: showPaymentFields
      ? z.string().min(1, { message: "Currency is required" })
      : z.string().optional(),
    salary: showPaymentFields
      ? z.number().min(0, { message: "Salary must be positive" })
      : z.number().optional(),
  });

  const form = useForm<NewSession>({
    initialValues: {
      ...initialValues,
      project_id: initialValues.project_id || project?.id || undefined,
    },
    validate: zodResolver(schema),
  });

  // Initialize form - when form opens, adjust start_time based on active/paused time
  useEffect(() => {
    if (!formInitialized) {
      const totalSeconds =
        form.values.active_seconds + form.values.paused_seconds;
      const endTime = new Date(form.values.end_time);
      const startTime = new Date(endTime.getTime() - totalSeconds * 1000);
      form.setFieldValue("start_time", startTime.toISOString());
      setFormInitialized(true);
    }
  }, [formInitialized, form]);

  useEffect(() => {
    if (project) {
      setShowPaymentFields(project.hourly_payment);
    }
  }, [project]);

  const projects = useMemo(() => {
    return (
      timerProjects.map((timerProject) => ({
        value: timerProject.project.id,
        label: timerProject.project.title,
      })) || []
    );
  }, [timerProjects]);

  // Calculate end_time when active_seconds changes
  const handleActiveSecondsChange = (value: number) => {
    form.setFieldValue("active_seconds", value);

    const totalSeconds = value + form.values.paused_seconds;

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

  // Handle paused_seconds changes and update end_time accordingly
  const handlePausedSecondsChange = (value: number) => {
    form.setFieldValue("paused_seconds", value);

    const totalSeconds = form.values.active_seconds + value;

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
      const activeSeconds = totalSeconds - form.values.paused_seconds;

      if (activeSeconds > 0) {
        // Round to nearest minute (60 seconds)
        const roundedSeconds = Math.round(activeSeconds / 60) * 60;
        form.setFieldValue("active_seconds", roundedSeconds);

        // Update end_time to match the rounded active seconds + paused seconds
        const newTotalSeconds = roundedSeconds + form.values.paused_seconds;
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
    console.log(userChangedEndTime);
    const endTime = userChangedEndTime
      ? new Date(form.values.end_time)
      : new Date(
          startTime.getTime() +
            form.values.active_seconds * 1000 +
            form.values.paused_seconds * 1000
        );
    const totalSeconds = Math.floor(
      (endTime.getTime() - startTime.getTime()) / 1000
    );

    if (totalSeconds > 0) {
      // Calculate active seconds by subtracting paused seconds
      const activeSeconds = totalSeconds - form.values.paused_seconds;

      if (activeSeconds > 0) {
        // Round to nearest minute
        const roundedSeconds = Math.round(activeSeconds / 60) * 60;
        form.setFieldValue("active_seconds", roundedSeconds);

        // Update end_time to match the rounded active seconds + paused seconds
        const newTotalSeconds = roundedSeconds + form.values.paused_seconds;
        const newEndTime = new Date(
          startTime.getTime() + newTotalSeconds * 1000
        );
        form.setFieldValue("end_time", newEndTime.toISOString());
      }
    }
  };

  function handleProjectChange(value: string | null) {
    if (!value) return;
    const project = timerProjects.find((p) => p.project.id === value);
    if (project) {
      form.setFieldValue("project_id", value);
      form.setFieldValue("currency", project.project.currency);
      form.setFieldValue("salary", project.project.salary);
      form.setFieldValue("hourly_payment", project.project.hourly_payment);
      setShowPaymentFields(project.project.hourly_payment);
    }
  }

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="lg">
        <Select
          allowDeselect={false}
          label="Project"
          value={form.values.project_id}
          error={form.errors.project_id}
          placeholder="Select project"
          data={projects}
          searchable
          onChange={handleProjectChange}
        />
        <TimeInput
          label="Active Time"
          value={form.values.active_seconds}
          onChange={handleActiveSecondsChange}
          error={form.errors.active_seconds}
          icon={<IconPlayerPlay size={18} />}
          color="green"
          data-autofocus={true}
          isOpen={true}
        />
        <TimeInput
          label="Paused Time"
          isOpen={true}
          value={form.values.paused_seconds}
          onChange={handlePausedSecondsChange}
          error={form.errors.paused_seconds}
          icon={<IconPlayerPause size={18} />}
          color="orange"
        />
        <DateTimePicker
          label="Start Time"
          value={form.values.start_time}
          onChange={handleStartTimeChange}
          error={form.errors.start_time}
        />
        <DateTimePicker
          label="End Time"
          value={form.values.end_time}
          onChange={handleEndTimeChange}
          error={form.errors.end_time}
        />
        <Textarea
          label="Memo"
          placeholder="Memo"
          {...form.getInputProps("memo")}
        />
        {showPaymentFields ? (
          <>
            <NumberInput
              label="Salary"
              min={0}
              step={0.01}
              {...form.getInputProps("salary")}
            />
            <Select
              label="Currency"
              placeholder="Select currency"
              data={currencies}
              {...form.getInputProps("currency")}
            />
          </>
        ) : (
          // Hidden fields for non-hourly payment projects
          <>
            <input type="hidden" {...form.getInputProps("salary")} />
            <input type="hidden" {...form.getInputProps("currency")} />
          </>
        )}
        {newSession ? (
          <CreateButton
            onClick={form.onSubmit(onSubmit)}
            type="submit"
            loading={submitting}
            mt="md"
            title="Create Session"
          />
        ) : (
          <UpdateButton
            onClick={form.onSubmit(onSubmit)}
            type="submit"
            loading={submitting}
            mt="md"
            title="Update Session"
          />
        )}
        {onCancel && <CancelButton onClick={onCancel} />}
      </Stack>
    </form>
  );
}
