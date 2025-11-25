"use client";

import { useFormatter } from "@/hooks/useFormatter";

import { Text } from "@mantine/core";

export default function FinanceRuleSettings() {
  const { getLocalizedText } = useFormatter();
  return (
    <Text size="sm" fw={700}>
      {getLocalizedText("Regeln", "Rules")}
    </Text>
  );
}
