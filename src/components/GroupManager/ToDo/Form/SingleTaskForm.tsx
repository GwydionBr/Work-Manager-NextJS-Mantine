"use client";

import { useForm } from "@mantine/form";
import { useFocusTrap } from "@mantine/hooks";
import { useGroupStore } from "@/stores/groupStore";
import { useUserStore } from "@/stores/userStore";

import { TextInput, Select, Stack, Button } from "@mantine/core";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import { DatePickerInput } from "@mantine/dates";

import { z } from "zod";
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
  onClose: () => void;
}

export default function SingleTaskForm({
  isLoading,
  handleSubmit,
  task,
  onClose,
}: SingleTaskFormProps) {
  const { activeGroupId } = useGroupStore();
  const activeGroup = useGroupStore((state) =>
    state.groups.find((g) => g.id === activeGroupId)
  );
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

  function handleFormSubmit(values: SingleTaskFormValues) {
    handleSubmit({
      ...values,
      date: new Date(values.date),
    });
  }

  return (
    <form onSubmit={form.onSubmit(handleFormSubmit)} ref={focusTrapRef}>
      <Stack>
        <TextInput
          withAsterisk
          label="Name"
          {...form.getInputProps("name")}
          data-autofocus
        />
        <Select
          withAsterisk
          label="Member"
          placeholder="Select member"
          data={memberIDs}
          {...form.getInputProps("memberID")}
        />
        <DatePickerInput
          label="Date"
          withAsterisk
          {...form.getInputProps("date")}
        />
        <CreateButton
          onClick={form.onSubmit(handleFormSubmit)}
          loading={isLoading}
          title="Create Task"
        />
        <CancelButton onClick={onClose} />
      </Stack>
    </form>
  );
}
