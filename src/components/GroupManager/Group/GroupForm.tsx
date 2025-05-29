"use client";

import { useForm } from "@mantine/form";
import { useState } from "react";
import { useGroupStore, GroupContent } from "@/stores/groupStore";
import { useUserStore } from "@/stores/userStore";

import { TextInput, Stack, Button, Alert, MultiSelect } from "@mantine/core";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";

const schema = z.object({
  title: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  memberIds: z.array(z.string()).optional(),
});

interface GroupFormProps {
  onClose: () => void;
  group?: GroupContent | null;
}

export default function GroupForm({ onClose, group }: GroupFormProps) {
  const { addGroup, updateGroup, updateGroupMembers } = useGroupStore();
  const { friends, profile } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      title: group?.title || "",
      description: group?.description || "",
      memberIds: [],
    },
    validate: zodResolver(schema),
  });

  async function handleFormSubmit(values: z.infer<typeof schema>) {
    setIsLoading(true);
    let success = false;
    if (group) {
      const didGroupChange =
        group.title !== values.title ||
        group.description !== values.description;
      if (didGroupChange) {
        success = await updateGroup(
          {
            id: group.id,
            title: values.title,
            description: values.description,
          },
          values.memberIds
        );
      } else if (!didGroupChange && values.memberIds) {
        success = await updateGroupMembers(
          group.id,
          values.memberIds
        );
      }
    } else {
      success = await addGroup(
        {
          title: values.title,
          description: values.description,
        },
        values.memberIds
      );
    }
    if (success) {
      form.reset();
      onClose();
    } else {
      if (group) {
        setError("Failed to update group. Please try again.");
      } else {
        setError("Failed to create group. Please try again.");
      }
    }
    setIsLoading(false);
  }

  return (
    <form onSubmit={form.onSubmit(handleFormSubmit)}>
      <Stack>
        <TextInput withAsterisk label="Name" {...form.getInputProps("title")} />
        <TextInput label="Description" {...form.getInputProps("description")} />
        <MultiSelect
          label="Members"
          data={friends
            .filter(
              (friend) =>
                !group?.members.some(
                  (member) => member.member.id === friend.profile.id
                )
            )
            .map((friend) => ({
              value: friend.profile.id,
              label: friend.profile.username,
            }))}
          {...form.getInputProps("memberIds")}
        />
        <Button type="submit" loading={isLoading}>
          Create
        </Button>
        {error && (
          <Alert variant="light" color="red">
            {error}
          </Alert>
        )}
      </Stack>
    </form>
  );
}
