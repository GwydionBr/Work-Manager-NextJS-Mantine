"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  Card,
  Text,
  TextInput,
  Button,
  Modal,
  Group,
  Stack,
  Select,
} from "@mantine/core";
import { IconArrowRight, IconCheck, IconUser } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { Locale } from "@/types/settings.types";
import ReactCountryFlag from "react-country-flag";
import { locales } from "@/constants/settings";
import { getOtherProfiles } from "@/actions/profile/profileActions";
import { Tables } from "@/types/db.types";

export default function InitializeProfile() {
  const { profile, updateProfile } = useUserStore();
  const { locale, setLocale, format24h, setFormat24h } = useSettingsStore();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [allProfiles, setAllProfiles] = useState<Tables<"profiles">[]>([]);

  if (!profile) {
    return null;
  }

  useEffect(() => {
    const fetchAllProfiles = async () => {
      const response = await getOtherProfiles();
      if (response.success) {
        setAllProfiles(response.data);
      }
    };
    fetchAllProfiles();
  }, []);

  const currentLocale = locales.find((l) => l.value === locale);

  const form = useForm({
    initialValues: {
      name: "",
      surname: "",
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

  async function handleSubmit(values: typeof form.values) {
    setIsUpdating(true);
    if (!profile) return;
    const response = await updateProfile({
      id: profile.id,
      full_name: `${values.name} ${values.surname}`,
      username: values.username,
      initialized: true,
    });
    console.log(response);
    setIsUpdating(false);
  }

  const isUsernameValid =
    !form.errors.username && form.values.username.length >= 3;
  const isOldUsername = profile.username === form.values.username;

  return (
    <Modal
      centered
      opened={true}
      onClose={() => {}}
      size="lg"
      title={
        <Group>
          <IconUser size={16} />
          <Text fw={600}>
            {locale === "de-DE"
              ? "Profil initialisieren"
              : "Initialize Profile"}
          </Text>
        </Group>
      }
    >
      <Card
        withBorder
        style={{ border: "2px solid var(--mantine-color-teal-3)" }}
      >
        <Stack>
          <Text>
            {locale === "de-DE"
              ? "Fülle die folgenden Informationen aus, um zu starten."
              : "Fill in the following information to get started."}
          </Text>
          <Group grow>
            <Select
              data={locales}
              label={locale === "de-DE" ? "Sprache" : "Language"}
              placeholder={
                locale === "de-DE" ? "Sprache auswählen" : "Select Language"
              }
              value={locale}
              allowDeselect={false}
              onChange={(value) => setLocale(value as Locale)}
              leftSection={
                currentLocale && (
                  <ReactCountryFlag
                    countryCode={currentLocale.flag}
                    svg
                    style={{ width: "1.2em", height: "1.2em" }}
                  />
                )
              }
              renderOption={({ option, ...others }) => {
                const localeData = locales.find(
                  (l) => l.value === option.value
                );
                return (
                  <div {...others}>
                    <Group gap="xs">
                      <ReactCountryFlag
                        countryCode={localeData?.flag || "US"}
                        svg
                        style={{ width: "1.2em", height: "1.2em" }}
                      />
                      <Text>{option.label}</Text>
                    </Group>
                  </div>
                );
              }}
            />
            <Select
              data={[
                { value: "24h", label: "24h" },
                { value: "12h", label: "12h" },
              ]}
              label={locale === "de-DE" ? "Zeitformat" : "Time Format"}
              placeholder={
                locale === "de-DE"
                  ? "Zeitformat auswählen"
                  : "Select Time Format"
              }
              value={format24h ? "24h" : "12h"}
              onChange={(value) => setFormat24h(value === "24h")}
            />
          </Group>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <TextInput
                label={locale === "de-DE" ? "Name" : "Name"}
                {...form.getInputProps("name")}
              />
              <TextInput
                label={locale === "de-DE" ? "Nachname" : "Surname"}
                {...form.getInputProps("surname")}
              />
              <Stack gap="md">
                <TextInput
                  withAsterisk
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
                        style={{
                          color: "var(--mantine-color-green-6)",
                        }}
                      />
                    ) : null
                  }
                />
                <Button
                  rightSection={<IconArrowRight size={16} />}
                  type="submit"
                  disabled={
                    !isUsernameValid || isUpdating || isOldUsername || !profile
                  }
                  loading={isUpdating}
                >
                  {locale === "de-DE" ? "Starten" : "Get Started"}
                </Button>
              </Stack>
            </Stack>
          </form>
        </Stack>
      </Card>
    </Modal>
  );
}
