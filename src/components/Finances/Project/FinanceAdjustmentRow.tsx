"use client";

import { Tables } from "@/types/db.types";
import { Group, Text, Box, Badge, ThemeIcon, Card } from "@mantine/core";
import { IconArrowRight, IconUser } from "@tabler/icons-react";
import { formatMoney, formatDate } from "@/utils/formatFunctions";
import { useSettingsStore } from "@/stores/settingsStore";
import { Currency } from "@/types/settings.types";
import { useFinanceStore } from "@/stores/financeStore";

interface FinanceAdjustmentRowProps {
  adjustment: Tables<"finance_project_adjustment">;
  currency: Currency;
}

export default function FinanceAdjustmentRow({
  adjustment,
  currency,
}: FinanceAdjustmentRowProps) {
  const { locale } = useSettingsStore();
  const { financeClients } = useFinanceStore();
  const isIncome = adjustment.amount > 0;
  const client = financeClients.find(
    (client) => client.id === adjustment.client_id
  );

  const getLocalizedText = (de: string, en: string) => {
    return locale === "de-DE" ? de : en;
  };

  return (
    <Card p="sm" withBorder shadow="sm" radius="md">
      <Group justify="space-between" align="flex-start">
        <Group gap="sm" align="center">
          <ThemeIcon
            size="sm"
            color={isIncome ? "green" : "red"}
            variant="light"
          >
            <IconArrowRight size={14} />
          </ThemeIcon>

          <Group gap="xs">
            <Text size="sm" fw={500} c={isIncome ? "green" : "red"}>
              {isIncome ? "+" : ""}
              {formatMoney(adjustment.amount, currency, locale)}
            </Text>

            {adjustment.description && (
              <Text size="sm" c="dimmed">
                {adjustment.description}
              </Text>
            )}
          </Group>
        </Group>

        <Group gap="xs" align="center">
          {client && (
            <Badge
              color="blue"
              variant="light"
              leftSection={<IconUser size={10} />}
              size="xs"
            >
              {client.name}
            </Badge>
          )}

          <Text size="xs" c="dimmed">
            {formatDate(new Date(adjustment.created_at), locale)}
          </Text>
        </Group>
      </Group>
    </Card>
  );
}
