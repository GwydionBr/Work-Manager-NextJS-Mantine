"use client";

import { useForm } from "@mantine/form";
import { useGroupStore } from "@/stores/groupStore";
import { useUserStore } from "@/stores/userStore";

import { TextInput, Select, Group, Stack, Button } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";

import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  memberID: z.string().min(1, "Member is required"),
  startDate: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val)),
  endDate: z
    .string()
    .or(z.date())
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
});

export interface RecurringTaskFormValues {
  name: string;
  memberID: string;
  startDate: Date;
  endDate: Date | null;
}

interface RecurringTaskFormProps {
  handleSubmit: (values: RecurringTaskFormValues) => void;
  isLoading: boolean;
}

export default function RecurringTaskForm({
  handleSubmit,
  isLoading,
}: RecurringTaskFormProps) {
  const { activeGroup } = useGroupStore();
  const { profile } = useUserStore();

  const form = useForm({
    initialValues: {
      name: "",
      memberID: profile?.id || "",
      startDate: new Date(),
      endDate: null,
    },
    validate: zodResolver(schema),
  });

  const memberIDs =
    activeGroup?.members.map((member) => {
      return {
        value: member.id,
        label: member.username,
      };
    }) || [];

  function handleFormSubmit(values: RecurringTaskFormValues) {
    handleSubmit({
      ...values,
      startDate: new Date(values.startDate),
      endDate: values.endDate ? new Date(values.endDate) : null,
    });
  }
  return (
    <form onSubmit={form.onSubmit(handleFormSubmit)}>
      <Stack>
        <TextInput
          withAsterisk
          label="Name"
          {...form.getInputProps("name")}
          data-autofocus
        />
        <Select
          label="Member"
          data={memberIDs}
          {...form.getInputProps("memberID")}
        />
        <Group grow>
          <DatePickerInput
            label="Start Date"
            withAsterisk
            {...form.getInputProps("startDate")}
          />
          <DatePickerInput
            label="End Date"
            clearable
            {...form.getInputProps("endDate")}
          />
        </Group>
        <Button type="submit" loading={isLoading}>
          Create
        </Button>
      </Stack>
    </form>
  );
}
