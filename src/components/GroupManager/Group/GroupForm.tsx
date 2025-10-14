"use client";

import { useForm } from "@mantine/form";
import { useMemo, useState } from "react";
import { useGroupStore, Group } from "@/stores/groupStore";
import { useFriendsQuery } from "@/utils/queries/profile/use-friends";
import { useSettingsStore } from "@/stores/settingsStore";

import { TextInput, Stack, Alert, MultiSelect } from "@mantine/core";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import UpdateButton from "@/components/UI/Buttons/UpdateButton";
import { FriendshipStatusEnum } from "@/types/profile.types";

const schema = z.object({
  title: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  memberIds: z.array(z.string()).optional(),
});

interface GroupFormProps {
  onClose: () => void;
  group?: Group | null;
}

export default function GroupForm({ onClose, group }: GroupFormProps) {
  const {
    addGroup,
    updateGroup,
    addGroupMembers: updateGroupMembers,
  } = useGroupStore();
  const { data: allFriends = [] } = useFriendsQuery();
  const { defaultGroupColor } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const friends = useMemo(
    () =>
      allFriends.filter(
        (friend) => friend.friendshipStatus === FriendshipStatusEnum.ACCEPTED
      ),
    [allFriends]
  );

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
        success = await updateGroupMembers(group.id, values.memberIds);
      }
    } else {
      success = await addGroup(
        {
          title: values.title,
          description: values.description,
        },
        defaultGroupColor,
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
        <TextInput
          withAsterisk
          label="Name"
          {...form.getInputProps("title")}
          data-autofocus
        />
        <TextInput label="Description" {...form.getInputProps("description")} />
        <MultiSelect
          label="Add Friends to the Group"
          hidePickedOptions={true}
          data={friends
            .filter(
              (friend) =>
                !group?.members.some((member) => member.id === friend.id) &&
                !group?.invitedMembers.some(
                  (invitedMember) => invitedMember.id === friend.id
                )
            )
            .map((friend) => ({
              value: friend.id,
              label: friend.username,
            }))}
          {...form.getInputProps("memberIds")}
        />
        {group ? (
          <UpdateButton
            onClick={form.onSubmit(handleFormSubmit)}
            type="submit"
            loading={isLoading}
            title="Update Group"
          />
        ) : (
          <CreateButton
            onClick={form.onSubmit(handleFormSubmit)}
            type="submit"
            loading={isLoading}
            title="Create Group"
          />
        )}
        <CancelButton onClick={onClose} />
        {error && (
          <Alert variant="light" color="red">
            {error}
          </Alert>
        )}
      </Stack>
    </form>
  );
}
