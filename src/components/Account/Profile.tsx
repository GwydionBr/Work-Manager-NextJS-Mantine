"use client";

import { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  Button,
  Card,
  Collapse,
  Group,
  Skeleton,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import LogoutButton from "../Auth/LogoutButton";
import PencilActionIcon from "../UI/ActionIcons/PencilActionIcon";
import CancelButton from "../UI/Buttons/CancelButton";
import DeleteUserButton from "../Auth/DeleteUserButton";
import {
  useOtherProfilesQuery,
  useProfileQuery,
  useUpdateProfileMutation,
} from "@/utils/queries/profile/use-profile";

export default function Profile() {
  const { getLocalizedText } = useSettingsStore();
  const { data: profile, isPending: isProfilePending } = useProfileQuery();
  const { data: otherProfiles, isPending: isOtherProfilesPending } =
    useOtherProfilesQuery();
  const { mutate: updateProfile, isPending: isUpdating } =
    useUpdateProfileMutation(() => setIsOpen(false));
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm({
    initialValues: {
      username: "",
    },
    validate: {
      username: (value) => {
        if (!value) return null;
        if (value.length < 3) return null;

        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          return getLocalizedText(
            "Benutzername kann nur Buchstaben, Zahlen und Unterstriche enthalten",
            "Username can only contain letters, numbers, and underscores"
          );
        }
        if (value.length > 20)
          return getLocalizedText(
            "Benutzername muss höchstens 20 Zeichen lang sein",
            "Username must be at most 20 characters long"
          );
        if (
          otherProfiles?.some(
            (p) => p.username === value && p.id !== profile?.id
          )
        ) {
          return getLocalizedText(
            "Benutzername ist bereits vergeben",
            "Username is already taken"
          );
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

  const closeForm = () => {
    setIsOpen(false);
    if (!profile) return;
    form.setFieldValue("username", profile.username);
  };

  const handleSubmit = async (values: { username: string }) => {
    if (!profile) return;
    updateProfile({
      id: profile.id,
      username: values.username,
    });
  };

  const isUsernameValid =
    !form.errors.username && form.values.username.length >= 3;
  const isOldUsername = profile?.username === form.values.username;

  return (
    <Card withBorder radius="md" shadow="md" p="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <DeleteUserButton disabled={isProfilePending} />
          <LogoutButton size="md" disabled={isProfilePending} />
        </Group>

        <Stack align="center">
          <Card w={350} withBorder radius="md" shadow="md">
            <Stack w="100%">
              <Group justify="space-between" gap="xl" align="center">
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">
                    {getLocalizedText("Benutzername", "Username")}
                  </Text>
                  {isProfilePending ? (
                    <Skeleton height={25} w={150} />
                  ) : (
                    <Text size="lg" fw={500}>
                      {profile?.username ||
                        getLocalizedText("Kein Benutzername", "No username")}
                    </Text>
                  )}
                </Stack>
                {profile && (
                  <PencilActionIcon onClick={() => setIsOpen(!isOpen)} />
                )}
              </Group>

              <Collapse in={isOpen}>
                <Group justify="flex-start">
                  <Card withBorder radius="md" shadow="sm" p="md">
                    <form onSubmit={form.onSubmit(handleSubmit)}>
                      <Stack gap="md">
                        <TextInput
                          label={getLocalizedText(
                            "Neuer Benutzername",
                            "New Username"
                          )}
                          placeholder={getLocalizedText(
                            "Gib einen neuen Benutzernamen ein (min. 3 Zeichen)",
                            "Enter new username (min. 3 characters)"
                          )}
                          {...form.getInputProps("username")}
                          rightSection={
                            isUsernameValid && !isOldUsername ? (
                              <IconCheck
                                size={16}
                                style={{
                                  color: "var(--mantine-color-green-6)",
                                }}
                              />
                            ) : null
                          }
                        />
                        <Group justify="flex-end" gap="sm">
                          <CancelButton onClick={closeForm} />
                          <Button
                            type="submit"
                            disabled={
                              !isUsernameValid || isUpdating || isOldUsername
                            }
                            loading={isUpdating}
                          >
                            {getLocalizedText(
                              "Änderungen speichern",
                              "Save Changes"
                            )}
                          </Button>
                        </Group>
                      </Stack>
                    </form>
                  </Card>
                </Group>
              </Collapse>

              <Stack gap="xs" align="flex-start">
                <Text size="sm" c="dimmed">
                  {getLocalizedText("E-Mail", "Email")}
                </Text>
                {isProfilePending ? (
                  <Skeleton height={25} w={150} />
                ) : (
                  <Text size="lg">
                    {profile?.email ||
                      getLocalizedText("Kein E-Mail", "No email")}
                  </Text>
                )}
              </Stack>
            </Stack>
          </Card>
        </Stack>
      </Stack>
    </Card>
  );
}
