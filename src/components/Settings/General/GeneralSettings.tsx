"use client";

import { useFormatter } from "@/hooks/useFormatter";

import { Stack } from "@mantine/core";
import SchemeButtonGroup from "./SchemeSettings";
import SettingsRow from "../SettingsRow";
import LocaleSettings from "./LocaleSettings";

export default function DefaultSettings() {
  const { getLocalizedText } = useFormatter();
  return (
    <Stack w="100%" p="md">
      <SettingsRow
        title={getLocalizedText("Farbschema", "Color Scheme")}
        children={<SchemeButtonGroup />}
      />
      <SettingsRow
        title={getLocalizedText("Sprache & Format", "Language & Format")}
        children={<LocaleSettings />}
      />
    </Stack>
  );
}
