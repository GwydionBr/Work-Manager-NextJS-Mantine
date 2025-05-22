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
  const { addGroup, updateGroup } = useGroupStore();
  const { friends, profile } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptedFriends = friends.filter(
    (friend) => friend.status === "accepted"
  );

  const form = useForm({
    initialValues: {
      title: group?.title || "",
      description: group?.description || "",
      memberIds:
        group?.members
          .map((member) => member.member.id)
          .filter((id) => id !== profile?.id) || [],
    },
    validate: zodResolver(schema),
  });

  async function handleFormSubmit(values: z.infer<typeof schema>) {
    setIsLoading(true);
    let success = false;
    if (group) {
      success = await updateGroup({
        id: group.id,
        ...values,
      });
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
          data={acceptedFriends.map((friend) => ({
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
