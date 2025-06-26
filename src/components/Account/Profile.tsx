"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/stores/userStore";
import { useForm } from "@mantine/form";
import {
  Button,
  Card,
  Collapse,
  Group,
  Loader,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import LogoutButton from "../Auth/LogoutButton";
import PencilActionIcon from "../UI/Buttons/PencilActionIcon";

export default function Profile() {
  const {
    allProfiles,
    profile,
    isFetching: isLoading,
    updateProfile,
  } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const form = useForm({
    initialValues: {
      username: "",
    },
    validate: {
      username: (value) => {
        if (!value) return null;
        if (value.length < 3) return null;

        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          return "Username can only contain letters, numbers, and underscores";
        }
        if (value.length > 20)
          return "Username must be at most 20 characters long";
        if (
          allProfiles?.some((p) => p.username === value && p.id !== profile?.id)
        ) {
          return "Username is already taken";
        }
        return null;
      },
    },
    validateInputOnChange: true,
    validateInputOnBlur: true,
  });

  useEffect(() => {
    if (profile) {
      form.setFieldValue("username", profile.username);
    }
  }, [profile]);

  if (isLoading) {
    return <Loader />;
  }

  if (!profile) {
    return <div>No Profile found</div>;
  }

  const closeForm = () => {
    setIsOpen(false);
    form.setFieldValue("username", profile.username);
  };

  const handleSubmit = async (values: { username: string }) => {
    setIsUpdating(true);
    const response = await updateProfile({
      id: profile.id,
      username: values.username,
    });
    if (response) {
      setIsOpen(false);
    }
    setIsUpdating(false);
  };

  const isUsernameValid =
    !form.errors.username && form.values.username.length >= 3;
  const isOldUsername = profile.username === form.values.username;

  return (
    <Card withBorder radius="md" shadow="md" p="xl">
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Stack gap="xs">
            <Text size="sm" c="dimmed">
              Username
            </Text>
            <Text size="lg" fw={500}>
              {profile.username}
            </Text>
          </Stack>
          <PencilActionIcon onClick={() => setIsOpen(!isOpen)} />
        </Group>

        <Collapse in={isOpen}>
          <Card withBorder radius="md" shadow="sm" p="md">
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                <TextInput
                  label="New Username"
                  placeholder="Enter new username (min. 3 characters)"
                  {...form.getInputProps("username")}
                  rightSection={
                    isUsernameValid && !isOldUsername ? (
                      <IconCheck
                        size={16}
                        style={{ color: "var(--mantine-color-green-6)" }}
                      />
                    ) : null
                  }
                />
                <Group justify="flex-end" gap="sm">
                  <Button variant="outline" color="gray" onClick={closeForm}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isUsernameValid || isUpdating || isOldUsername}
                    loading={isUpdating}
                  >
                    Save Changes
                  </Button>
                </Group>
              </Stack>
            </form>
          </Card>
        </Collapse>

        <Stack gap="xs">
          <Text size="sm" c="dimmed">
            Email
          </Text>
          <Text size="lg">{profile.email}</Text>
        </Stack>

        <LogoutButton />
      </Stack>
    </Card>
  );
}
