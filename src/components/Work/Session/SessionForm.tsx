import { Button, NumberInput, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { DateTimePicker } from "@mantine/dates";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";

interface NewSession {
  start_time: Date;
  active_seconds: number;
  paused_seconds: number;
  currency: string;
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
  start_time: z.date(),
  active_seconds: z
    .number()
    .min(1, { message: "Active seconds must be bigger than 0" }),
  paused_seconds: z
    .number()
    .min(0, { message: "Paused seconds must be positive or 0" }),
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
      <Stack>
        <DateTimePicker
          label="Start Time"
          value={form.values.start_time}
          {...form.getInputProps("start_time")}
        />
        <NumberInput
          label="Active Seconds"
          min={0}
          step={1}
          {...form.getInputProps("active_seconds")}
        />
        <NumberInput
          label="Paused Seconds"
          min={0}
          step={1}
          {...form.getInputProps("paused_seconds")}
        />
        <NumberInput
          label="Salary"
          min={0}
          step={0.01}
          {...form.getInputProps("salary")}
        />
        <TextInput
          label="Currency"
          placeholder="€, $, etc."
          {...form.getInputProps("currency")}
        />

        <Button type="submit">
          {newSession ? "Create Session" : "Save Changes"}
        </Button>
        <Button onClick={onCancel} color="red" variant="outline">
          Cancel
        </Button>
      </Stack>
    </form>
  );
}
