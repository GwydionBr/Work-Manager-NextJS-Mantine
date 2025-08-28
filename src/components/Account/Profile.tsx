"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/stores/userStore";
import { useForm } from "@mantine/form";
import { useSettingsStore } from "@/stores/settingsStore";

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
import PencilActionIcon from "../UI/ActionIcons/PencilActionIcon";
import CancelButton from "../UI/Buttons/CancelButton";

export default function Profile() {
  const { locale } = useSettingsStore();
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
          return locale === "de-DE"
            ? "Benutzername kann nur Buchstaben, Zahlen und Unterstriche enthalten"
            : "Username can only contain letters, numbers, and underscores";
        }
        if (value.length > 20)
          return locale === "de-DE"
            ? "Benutzername muss höchstens 20 Zeichen lang sein"
            : "Username must be at most 20 characters long";
        if (
          allProfiles?.some((p) => p.username === value && p.id !== profile?.id)
        ) {
          return locale === "de-DE"
            ? "Benutzername ist bereits vergeben"
            : "Username is already taken";
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
    return (
      <div>
        {locale === "de-DE" ? "Kein Profil gefunden" : "No Profile found"}
      </div>
    );
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
              {locale === "de-DE" ? "Benutzername" : "Username"}
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
                  label={
                    locale === "de-DE" ? "Neuer Benutzername" : "New Username"
                  }
                  placeholder={
                    locale === "de-DE"
                      ? "Gib einen neuen Benutzernamen ein (min. 3 Zeichen)"
                      : "Enter new username (min. 3 characters)"
                  }
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
                  <CancelButton onClick={closeForm} />
                  <Button
                    type="submit"
                    disabled={!isUsernameValid || isUpdating || isOldUsername}
                    loading={isUpdating}
                  >
                    {locale === "de-DE"
                      ? "Änderungen speichern"
                      : "Save Changes"}
                  </Button>
                </Group>
              </Stack>
            </form>
          </Card>
        </Collapse>

        <Stack gap="xs">
          <Text size="sm" c="dimmed">
            {locale === "de-DE" ? "E-Mail" : "Email"}
          </Text>
          <Text size="lg">{profile.email}</Text>
        </Stack>

        <LogoutButton />
      </Stack>
    </Card>
  );
}
