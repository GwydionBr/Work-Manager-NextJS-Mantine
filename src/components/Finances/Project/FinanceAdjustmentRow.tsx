"use client";

import { Tables } from "@/types/db.types";
import { Group, Text } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { formatMoney } from "@/utils/formatFunctions";
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
  return (
    <Group>
      <IconArrowRight color="light-dark(var(--mantine-color-teal-6), var(--mantine-color-teal-4))" />
      <Text c={adjustment.amount > 0 ? "green" : "red"}>
        {formatMoney(adjustment.amount, currency, locale)}
      </Text>
      <Text>{adjustment.description}</Text>
      <Text>
        {
          financeClients.find((client) => client.id === adjustment.client_id)
            ?.name
        }
      </Text>
    </Group>
  );
}
