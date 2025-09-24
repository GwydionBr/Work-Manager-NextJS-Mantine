"use client";

import { Tables } from "@/types/db.types";
import { Group, Text, Box, Badge, ThemeIcon, Card } from "@mantine/core";
import {
  IconArrowRight,
  IconMinus,
  IconPlus,
  IconUser,
  IconArrowLeft,
} from "@tabler/icons-react";
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
    (client) => client.id === adjustment.finance_client_id
  );

  return (
    <Card p="sm" withBorder shadow="sm" radius="md">
      <Group justify="space-between" align="flex-start">
        <Group gap="xs" align="center">
          <ThemeIcon
            size="sm"
            color={isIncome ? "green" : "red"}
            variant="transparent"
          >
            {isIncome ? (
              <IconArrowRight size={14} />
            ) : (
              <IconArrowLeft size={14} />
            )}
          </ThemeIcon>
          <ThemeIcon
            size="sm"
            color={isIncome ? "green" : "red"}
            variant="light"
          >
            {isIncome ? <IconPlus size={14} /> : <IconMinus size={14} />}
          </ThemeIcon>
          <Group gap="xs">
            <Text size="sm" fw={500} c={isIncome ? "green" : "red"}>
              {formatMoney(Math.abs(adjustment.amount), currency, locale)}
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
