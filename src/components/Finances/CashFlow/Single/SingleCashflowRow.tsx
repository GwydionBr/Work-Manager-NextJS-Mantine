"use client";

import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Badge, Card, CardProps, Grid, Text, Group } from "@mantine/core";
import { IconCashMoveBack, IconCashMove, IconTag } from "@tabler/icons-react";

import { formatDate, formatMoney } from "@/utils/formatFunctions";
import { Tables } from "@/types/db.types";

export default function SingleCashflowRow({
  cashflow,
  ...props
}: {
  cashflow: Tables<"single_cash_flow">;
} & CardProps) {
  const { locale } = useSettingsStore();
  const { financeCategories } = useFinanceStore();
  return (
    <Card withBorder shadow="sm" radius="md" p="sm" {...props}>
      <Grid>
        <Grid.Col span={2}>
          <Group>
            {cashflow.type === "expense" ? (
              <IconCashMoveBack color="red" />
            ) : (
              <IconCashMove color="green" />
            )}
            <Text fw={700} c={cashflow.type === "expense" ? "red" : "green"}>
              {formatMoney(cashflow.amount, cashflow.currency, locale)}
            </Text>
          </Group>
        </Grid.Col>
        <Grid.Col span={7}>
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
