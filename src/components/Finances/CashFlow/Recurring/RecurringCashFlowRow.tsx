"use client";

import { useHover, useDisclosure } from "@mantine/hooks";
import { useSettingsStore } from "@/stores/settingsStore";
import { useFinanceStore } from "@/stores/financeStore";
import { Tables } from "@/types/db.types";
import { formatDate, formatMoney } from "@/utils/formatFunctions";
import { Badge, Card, CardProps, Group, Text, ThemeIcon } from "@mantine/core";
import { IconCalendar, IconCalendarOff, IconTag } from "@tabler/icons-react";
import { FinanceInterval } from "@/types/settings.types";

interface RecurringCashFlowRowProps extends CardProps {
  cashflow: Tables<"recurring_cash_flow">;
  showEndDate?: boolean;
  showStartDate?: boolean;
  onEdit: () => void;
  getIntervalLabel: (interval: FinanceInterval) => string;
}

export default function RecurringCashFlowRow({
  cashflow,
  onEdit,
  showEndDate,
  showStartDate,
  getIntervalLabel,
  ...props
}: RecurringCashFlowRowProps) {
  const { locale } = useSettingsStore();
  const { financeCategories } = useFinanceStore();
  const { hovered, ref } = useHover();
  return (
    <Card
      withBorder
      shadow="sm"
      radius="md"
      p="xs"
      bg={
        hovered
          ? "light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))"
          : "light-dark(var(--mantine-color-white), var(--mantine-color-dark-7))"
      }
      {...props}
      ref={ref}
      onClick={onEdit}
      style={{
        border: hovered ? "1px solid var(--mantine-color-blue-6)" : "",
        cursor: hovered ? "pointer" : "default",
      }}
    >
      <Group justify="space-between" wrap="nowrap" grow>
        <Group wrap="nowrap">
          <Text
            fw={700}
            c={cashflow.type === "expense" ? "red" : "green"}
            w={70}
          >
            {formatMoney(cashflow.amount, cashflow.currency, locale)}
          </Text>
          <Badge variant="light">{getIntervalLabel(cashflow.interval)}</Badge>
        </Group>
        <Group w="100%">
          <Text>{cashflow.title}</Text>
        </Group>
        <Group>
          {showStartDate && (
            <Group gap={5}>
              <ThemeIcon variant="transparent" color="green">
                <IconCalendar size={20} />
              </ThemeIcon>
              <Text>{formatDate(new Date(cashflow.start_date), locale)}</Text>
            </Group>
          )}
          {showEndDate && cashflow.end_date && (
            <Group gap={5}>
              <ThemeIcon variant="transparent" color="red">
                <IconCalendarOff size={20} />
              </ThemeIcon>
              <Text>{formatDate(new Date(cashflow.end_date), locale)}</Text>
            </Group>
          )}
        </Group>
        <Group>
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
        </Group>
      </Group>
    </Card>
  );
}
