"use client";

import { useSettingsStore } from "@/stores/settingsStore";

import { Text, Stack, Card } from "@mantine/core";

import type { Tables } from "@/types/db.types";

interface NewProjectPayoutCardProps {
  project: Tables<"timer_project">;
}

export default function NewProjectPayoutCard({
  project,
}: NewProjectPayoutCardProps) {
  const { locale } = useSettingsStore();

  return (
    <Card withBorder radius="md" p="md" shadow="md" w="100%" maw={500}>
      <Stack p="md" gap="md">
        <Text size="sm" fw={500}>
          {locale === "de-DE"
            ? "Neue Projektvergütung auszahlen"
            : "New Project Payout Card"}
        </Text>
      </Stack>
    </Card>
  );
}
