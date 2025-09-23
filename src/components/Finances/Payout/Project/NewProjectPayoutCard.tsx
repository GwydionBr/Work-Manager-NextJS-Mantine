"use client";

import { useSettingsStore } from "@/stores/settingsStore";

import { Text, Stack, Card, Group } from "@mantine/core";

import type { Tables } from "@/types/db.types";
import { IconBrandCashapp } from "@tabler/icons-react";
import QuickPayoutButton from "../Hourly/QuickPayoutButton";

interface NewProjectPayoutCardProps {
  project: Tables<"timer_project">;
}

export default function NewProjectPayoutCard({
  project,
}: NewProjectPayoutCardProps) {
  const { locale } = useSettingsStore();

  return (
    <Card withBorder radius="md" mb="md" p="md" shadow="md" w="100%" maw={400}>
      <Card.Section>
        <Group p="md" gap="md">
          <IconBrandCashapp />
          <Text size="sm" fw={500}>
            {locale === "de-DE" ? "Schnelle Auszahlung" : "Quick Payout"}
          </Text>
        </Group>
      </Card.Section>
      <Card.Section></Card.Section>
      {/* <PayoutModal
        opened={openedModal}
        handleClose={closeModal}
        sessionPayouts={sessionPayouts}
        sessionIds={selectedSessionIds}
        payoutCategoryId={project.project.cash_flow_category_id}
        projectTitle={project.project.title}
      /> */}
    </Card>
  );
}
