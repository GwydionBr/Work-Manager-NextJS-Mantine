"use client";

import { useHover } from "@mantine/hooks";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Badge, Card, CardProps, Grid, Text, Group } from "@mantine/core";
import { IconTag } from "@tabler/icons-react";

import { formatMoney } from "@/utils/formatFunctions";
import { Tables } from "@/types/db.types";

interface SingleCashflowRowProps extends CardProps {
  cashflow: Tables<"single_cash_flow">;
  onEdit: () => void;
}

export default function SingleCashflowRow({
  cashflow,
  onEdit,
  ...props
}: SingleCashflowRowProps) {
  const { locale } = useSettingsStore();
  const { financeCategories } = useFinanceStore();
  const { hovered, ref } = useHover();
  return (
    <Card
      withBorder
      shadow="sm"
      h={45}
      radius="md"
      p="xs"
      bg={
        hovered
          ? "light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-7))"
          : "light-dark(var(--mantine-color-white), var(--mantine-color-dark-6))"
      }
      style={{
        cursor: "pointer",
        border: hovered ? "1px solid var(--mantine-color-blue-6)" : "",
      }}
      onClick={onEdit}
      {...props}
      ref={ref}
    >
      <Grid>
        <Grid.Col span={2}>
          <Group>
            <Text fw={700} c={cashflow.type === "expense" ? "red" : "green"}>
              {formatMoney(cashflow.amount, cashflow.currency, locale)}
            </Text>
          </Group>
        </Grid.Col>
        <Grid.Col span={6}>
          <Text>{cashflow.title}</Text>
        </Grid.Col>
        <Grid.Col span={3}>
          {cashflow.category_id && (
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
          )}
        </Grid.Col>
      </Grid>
    </Card>
  );
}
