import { useForm } from "@mantine/form";

import { Button, NumberInput, Select, Stack } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { IconPlayerPlay, IconPlayerPause } from "@tabler/icons-react";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import { currencies } from "@/constants/settings";
import TimeInput from "@/components/Work/Session/SessionTimeInput";

import { Currency } from "@/types/settings.types";

interface NewSession {
  start_time: string;
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
}

const schema = z.object({
  start_time: z.string().transform((str) => new Date(str).toISOString()),
  active_seconds: z
    .number()
    .min(1, { message: "Active time must be greater than 0" }),
  paused_seconds: z
    .number()
    .min(0, { message: "Paused time must be positive or 0" }),
  currency: z.string().min(1, { message: "Currency is required" }),
  salary: z.number().min(0, { message: "Salary must be positive" }),
});

export default function SessionForm({
  initialValues,
  onSubmit,
  onCancel,
  newSession,
}: SessionFormProps) {
  const form = useForm<NewSession>({
    initialValues,
    validate: zodResolver(schema),
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="lg">
        <TimeInput
          label="Active Time"
          value={form.values.active_seconds}
          onChange={(value) => form.setFieldValue("active_seconds", value)}
          error={form.errors.active_seconds}
          icon={<IconPlayerPlay size={18} />}
          color="green"
          autoFocus={true}
        />
        <TimeInput
          label="Paused Time"
          value={form.values.paused_seconds}
          onChange={(value) => form.setFieldValue("paused_seconds", value)}
          error={form.errors.paused_seconds}
          icon={<IconPlayerPause size={18} />}
          color="orange"
        />
        <NumberInput
          label="Salary"
          min={0}
          step={0.01}
          {...form.getInputProps("salary")}
        />
        <DateTimePicker
          label="Start Time"
          value={form.values.start_time}
          {...form.getInputProps("start_time")}
        />
        <Select
          label="Currency"
          placeholder="Select currency"
          data={currencies}
          {...form.getInputProps("currency")}
        />
        <Button type="submit" mt="md">
          {newSession ? "Create Session" : "Save Changes"}
        </Button>
        <Button onClick={onCancel} color="red" variant="outline">
          Cancel
        </Button>
      </Stack>
    </form>
  );
}
