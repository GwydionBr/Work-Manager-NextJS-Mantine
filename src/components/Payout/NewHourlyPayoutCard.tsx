"use client";

import { useSettingsStore } from "@/stores/settingsStore";

import { Text, Stack, Card, Group, Box } from "@mantine/core";

import { TimerProject } from "@/types/work.types";
import { IconBrandCashapp } from "@tabler/icons-react";

interface NewHourlyPayoutCardProps {
  project: TimerProject;
}
export default function NewHourlyPayoutCard({
  project,
}: NewHourlyPayoutCardProps) {
  const { locale } = useSettingsStore();

  return (
    <Card withBorder radius="md" p="md" shadow="md" w="100%" maw={400}>
      <Card.Section>
        <Group p="md" gap="md">
          <IconBrandCashapp />
          <Text size="sm" fw={500}>
            {locale === "de-DE" ? "Schnelle Auszahlung" : "Quick Payout"}
          </Text>
        </Group>
      </Card.Section>
      <Card.Section>
        <Stack p="md" gap="md">
          <Box>All time</Box>
          <Box>Last month</Box>
          <Box>This month</Box>

        </Stack>
      </Card.Section>
    </Card>
  );
}
