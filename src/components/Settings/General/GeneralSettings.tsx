"use client";

import { useSettingsStore } from "@/stores/settingsStore";

import { Stack } from "@mantine/core";
import SchemeButtonGroup from "./SchemeSettings";
import SettingsRow from "../SettingsRow";
import LocaleSettings from "./LocaleSettings";

export default function DefaultSettings() {
  const { locale } = useSettingsStore();
  return (
    <Stack w="100%" p="md">
      <SettingsRow
        title={locale === "de-DE" ? "Farbschema" : "Color Scheme"}
        children={<SchemeButtonGroup />}
      />
      <SettingsRow
        title={locale === "de-DE" ? "Sprache & Format" : "Language & Format"}
        children={<LocaleSettings />}
      />
    </Stack>
  );
}
