"use client";

import { useMemo } from "react";
import { useDisclosure, useHover } from "@mantine/hooks";
import { useSettingsStore } from "@/stores/settingsStore";

import { formatDate, formatMoney } from "@/utils/formatFunctions";
import { Badge, Card, CardProps, Group, Text, ThemeIcon } from "@mantine/core";
import {
  IconCalendar,
  IconCalendarOff,
  IconCalendarTime,
} from "@tabler/icons-react";
import FinanceCategoryBadges from "../../Category/FinanceCategoryBadges";

import { getNextDate } from "@/utils/financeHelperFunction";
import { isToday } from "date-fns";

import { RecurringCashFlow } from "@/types/finance.types";
import { FinanceInterval } from "@/types/settings.types";
import { Tables } from "@/types/db.types";
import { useFinanceCategoriesQuery } from "@/utils/queries/finances/use-finance-category";
import { useUpdateRecurringCashflowMutation } from "@/utils/queries/finances/use-recurring-cashflow";

interface RecurringCashFlowRowProps extends CardProps {
  cashflow: RecurringCashFlow;
  showEndDate?: boolean;
  showStartDate?: boolean;
  showNextDate?: boolean;
  onEdit: () => void;
  getIntervalLabel: (interval: FinanceInterval) => string;
}

export default function RecurringCashFlowRow({
  cashflow,
  onEdit,
  showEndDate,
  showStartDate,
  showNextDate,
  getIntervalLabel,
  ...props
}: RecurringCashFlowRowProps) {
  const { locale } = useSettingsStore();
  const {
    mutate: updateRecurringCashFlow,
    isPending: isUpdatingRecurringCashFlow,
  } = useUpdateRecurringCashflowMutation();
  const { data: financeCategories } = useFinanceCategoriesQuery();
  const { hovered, ref } = useHover();
  const [
    isCategoryPopoverOpen,
    { open: openCategoryPopover, close: closeCategoryPopover },
  ] = useDisclosure(false);

  const currentCategories = useMemo(() => {
    return financeCategories?.filter((category) =>
      cashflow.categories
        .map((category) => category.finance_category.id)
        .includes(category.id)
    );
  }, [financeCategories, cashflow.categories]);

  const nextDate = useMemo(() => {
    if (!showNextDate) return null;
    return getNextDate(cashflow.interval, new Date(cashflow.start_date));
  }, [cashflow.interval, cashflow.start_date]);

  const handleCategoryClose = async (
    updatedCategories: Tables<"finance_category">[] | null
  ) => {
    if (isUpdatingRecurringCashFlow) return;
    closeCategoryPopover();
    if (updatedCategories) {
      updateRecurringCashFlow({
        recurringCashFlow: {
          ...cashflow,
          categories: updatedCategories.map((c) => ({
            finance_category: c,
          })),
        },
        // TODO: Ask user if they want to update the single cash flows
        shouldUpdateSingleCashFlows: true,
      });
    }
  };

  return (
    <Card
      withBorder
      shadow="sm"
      radius="md"
      p="xs"
      bg={
        hovered
          ? "light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-7))"
          : "light-dark(var(--mantine-color-white), var(--mantine-color-dark-6))"
      }
      {...props}
      ref={ref}
      onClick={() => {
        if (!isCategoryPopoverOpen) {
          onEdit();
        }
      }}
      style={{
        border: hovered ? "1px solid var(--mantine-color-blue-6)" : "",
        cursor: hovered ? "pointer" : "default",
      }}
    >
      <Group justify="space-between" grow>
        <Group>
          <Text fw={700} c={cashflow.amount <= 0 ? "red" : "green"} w={70}>
            {formatMoney(cashflow.amount, cashflow.currency, locale)}
          </Text>
          <Badge variant="light">{getIntervalLabel(cashflow.interval)}</Badge>
        </Group>
        <Group justify="flex-start">
          <Text>{cashflow.title}</Text>
        </Group>

        <Group justify="space-between">
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
            {showNextDate && nextDate && (
              <Group gap={5}>
                <ThemeIcon
                  variant="transparent"
                  color={isToday(nextDate) ? "yellow" : "blue"}
                >
                  <IconCalendarTime size={20} />
                </ThemeIcon>
                <Text>{formatDate(nextDate, locale)}</Text>
              </Group>
            )}
          </Group>
          <FinanceCategoryBadges
            initialCategories={currentCategories ?? []}
            onPopoverOpen={openCategoryPopover}
            onPopoverClose={handleCategoryClose}
            showAddCategory={hovered}
          />
        </Group>
      </Group>
    </Card>
  );
}
