import { useForm } from "@mantine/form";

import { NumberInput, Select, Stack } from "@mantine/core";
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
  start_time: string;
  end_time: string;
  active_seconds: number;
  paused_seconds: number;
  currency: Currency;
  salary: number;
  [key: string]: unknown;
}

interface SessionFormProps {
  initialValues: NewSession;
  onSubmit: (values: NewSession) => void;
  onCancel: () => void;
  newSession: boolean;
  project?: Tables<"timerProject">;
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
  // If project doesn't have hourly payment, set salary to 0 and currency to project currency
  const shouldShowPaymentFields = project?.hourly_payment ?? true;

  // Create conditional schema based on hourly_payment
  const schema = z.object({
    start_time: z.string().transform((str) => new Date(str).toISOString()),
    end_time: z.string().transform((str) => new Date(str).toISOString()),
    active_seconds: z
      .number()
      .min(1, { message: "Active time must be greater than 0" }),
    paused_seconds: z
      .number()
      .min(0, { message: "Paused time must be positive or 0" }),
    currency: shouldShowPaymentFields
      ? z.string().min(1, { message: "Currency is required" })
      : z.string().optional(),
    salary: shouldShowPaymentFields
      ? z.number().min(0, { message: "Salary must be positive" })
      : z.number().optional(),
  });

  const form = useForm<NewSession>({
    initialValues,
    validate: zodResolver(schema),
  });

  // Calculate end_time when active_seconds changes
  const handleActiveSecondsChange = (value: number) => {
    form.setFieldValue("active_seconds", value);

    const startTime = new Date(form.values.start_time);
    const totalSeconds = value + form.values.paused_seconds;
    const endTime = new Date(startTime.getTime() + totalSeconds * 1000);
    form.setFieldValue("end_time", endTime.toISOString());
  };

  // Calculate active_seconds when end_time changes (rounded to nearest minute)
  const handleEndTimeChange = (value: string | null) => {
    if (!value) return;

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

  // Handle paused_seconds changes and update end_time accordingly
  const handlePausedSecondsChange = (value: number) => {
    form.setFieldValue("paused_seconds", value);

    // If we have active_seconds, update end_time
    if (form.values.active_seconds > 0) {
      const startTime = new Date(form.values.start_time);
      const totalSeconds = form.values.active_seconds + value;
      const endTime = new Date(startTime.getTime() + totalSeconds * 1000);
      form.setFieldValue("end_time", endTime.toISOString());
    }
  };

  // Handle start_time changes and update end_time/active_seconds accordingly
  const handleStartTimeChange = (value: string | null) => {
    if (!value) return;

    form.setFieldValue("start_time", value);

    const startTime = new Date(value);
    const endTime = new Date(form.values.end_time);
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

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="lg">
        <TimeInput
          label="Active Time"
          value={form.values.active_seconds}
          onChange={handleActiveSecondsChange}
          error={form.errors.active_seconds}
          icon={<IconPlayerPlay size={18} />}
          color="green"
          autoFocus={true}
        />
        <TimeInput
          label="Paused Time"
          value={form.values.paused_seconds}
          onChange={handlePausedSecondsChange}
          error={form.errors.paused_seconds}
          icon={<IconPlayerPause size={18} />}
          color="orange"
        />
        {shouldShowPaymentFields ? (
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
        {newSession ? (
          <CreateButton
            onClick={form.onSubmit(onSubmit)}
            loading={submitting}
            variant="filled"
            mt="md"
            title="Create Session"
          />
        ) : (
          <UpdateButton
            onClick={form.onSubmit(onSubmit)}
            loading={submitting}
            variant="filled"
            mt="md"
            title="Save Session"
          />
        )}
        {onCancel && <CancelButton onClick={onCancel} />}
      </Stack>
    </form>
  );
}
