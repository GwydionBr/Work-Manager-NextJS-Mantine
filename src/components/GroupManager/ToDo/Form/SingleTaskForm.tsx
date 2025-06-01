"use client";

import { useForm } from "@mantine/form";
import { useFocusTrap } from "@mantine/hooks";
import { useGroupStore } from "@/stores/groupStore";
import { useUserStore } from "@/stores/userStore";

import { TextInput, Select, Stack, Button } from "@mantine/core";

import { z } from "zod";
import { DatePickerInput } from "@mantine/dates";
import { zodResolver } from "mantine-form-zod-resolver";
import { Tables } from "@/types/db.types";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  memberID: z.string().min(1, "Member is required"),
  date: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val)),
});

export interface SingleTaskFormValues {
  name: string;
  memberID: string;
  date: Date;
}

interface SingleTaskFormProps {
  task?: Tables<"group_task">;
  isLoading: boolean;
  handleSubmit: (values: SingleTaskFormValues) => void;
}

export default function SingleTaskForm({
  isLoading,
  handleSubmit,
  task,
}: SingleTaskFormProps) {
  const { activeGroup } = useGroupStore();
  const { profile } = useUserStore();

  const focusTrapRef = useFocusTrap();

  const form = useForm({
    initialValues: {
      name: task?.title || "",
      memberID: task?.user_id || profile?.id || "",
      date: new Date(),
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

  const adminIds =
    activeGroup?.admins.map((admin) => {
      return {
        value: admin.id,
        label: admin.username,
      };
    }) || [];

  const allMemberIds = [...memberIDs, ...adminIds];

  function handleFormSubmit(values: SingleTaskFormValues) {
    handleSubmit({
      ...values,
      date: new Date(values.date),
    });
  }

  return (
    <form onSubmit={form.onSubmit(handleFormSubmit)} ref={focusTrapRef}>
      <Stack>
        <TextInput withAsterisk label="Name" {...form.getInputProps("name")} />
        <Select
          withAsterisk
          label="Member"
          placeholder="Select member"
          data={allMemberIds}
          {...form.getInputProps("memberID")}
        />
        <DatePickerInput
          label="Date"
          withAsterisk
          {...form.getInputProps("date")}
        />
        <Button type="submit" loading={isLoading}>
          Create
        </Button>
      </Stack>
    </form>
  );
}
