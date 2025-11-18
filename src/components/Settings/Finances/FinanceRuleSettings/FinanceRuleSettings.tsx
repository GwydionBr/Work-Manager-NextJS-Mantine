"use client";

import { useSettingsStore } from "@/stores/settingsStore";

import { Text } from "@mantine/core";

export default function FinanceRuleSettings() {
  const { locale } = useSettingsStore();
  return (
    <Text size="sm" fw={700}>
      {locale === "de-DE" ? "Regeln" : "Rules"}
    </Text>
  );
}
