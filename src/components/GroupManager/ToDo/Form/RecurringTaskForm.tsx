"use client";

import { useForm } from "@mantine/form";
import { useGroupStore } from "@/stores/groupStore";
import { useProfileQuery } from "@/utils/queries/profile/use-profile";

import { TextInput, Select, Group, Stack, Button } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import CancelButton from "@/components/UI/Buttons/CancelButton";

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
  onClose: () => void;
}

export default function RecurringTaskForm({
  handleSubmit,
  isLoading,
  onClose,
}: RecurringTaskFormProps) {
  const { activeGroupId } = useGroupStore();
  const activeGroup = useGroupStore((state) =>
    state.groups.find((g) => g.id === activeGroupId)
  );
  const { data: profile } = useProfileQuery();

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
        <CreateButton
          type="submit"
          onClick={form.onSubmit(handleFormSubmit)}
          loading={isLoading}
          title="Create Task"
        />
        <CancelButton onClick={onClose} />
      </Stack>
    </form>
  );
}
