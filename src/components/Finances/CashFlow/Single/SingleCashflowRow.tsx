"use client";

import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Badge, Card, Grid, Text } from "@mantine/core";
import { IconTag } from "@tabler/icons-react";

import { formatDate, formatMoney } from "@/utils/formatFunctions";
import { Tables } from "@/types/db.types";

export default function SingleCashflowRow({
  cashflow,
}: {
  cashflow: Tables<"single_cash_flow">;
}) {
  const { locale } = useSettingsStore();
  const { financeCategories } = useFinanceStore();
  return (
    <Card withBorder shadow="sm" radius="md" p="sm">
      <Grid>
        <Grid.Col span={3}>
          <Text>{formatDate(new Date(cashflow.date), locale)}</Text>
        </Grid.Col>
        <Grid.Col span={3}>
          <Text>{formatMoney(cashflow.amount, cashflow.currency, locale)}</Text>
        </Grid.Col>
        <Grid.Col span={3}>
          <Text>{cashflow.title}</Text>
        </Grid.Col>
        <Grid.Col span={3}>
          <Badge
            color="grape"
            variant="light"
            leftSection={<IconTag size={12} />}
          >
            {
              financeCategories.find(
                (category) => category.id === cashflow.category_id
              )?.title
            }
          </Badge>
        </Grid.Col>
      </Grid>
    </Card>
  );
}
