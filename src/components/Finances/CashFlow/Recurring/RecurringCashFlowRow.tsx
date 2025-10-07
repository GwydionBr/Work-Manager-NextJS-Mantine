"use client";

import { useMemo, useState } from "react";
import { useDisclosure, useHover } from "@mantine/hooks";
import { useSettingsStore } from "@/stores/settingsStore";
import { useFinanceStore } from "@/stores/financeStore";

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
import useFinanceCategoriesQuery from "@/utils/queries/finances/use-finance-categories-query";


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
  const [isLoading, setIsLoading] = useState(false);
  const { locale } = useSettingsStore();
  const { updateRecurringCashFlow } = useFinanceStore();
  const { data: financeCategories } = useFinanceCategoriesQuery();
  const { hovered, ref } = useHover();
  const [
    isCategoryPopoverOpen,
    { open: openCategoryPopover, close: closeCategoryPopover },
  ] = useDisclosure(false);

  const currentCategories = useMemo(() => {
    return financeCategories?.filter((category) =>
      cashflow.categories.map((category) => category.finance_category.id).includes(category.id)
    );
  }, [financeCategories, cashflow.categories]);

  const nextDate = useMemo(() => {
    if (!showNextDate) return null;
    return getNextDate(cashflow.interval, new Date(cashflow.start_date));
  }, [cashflow.interval, cashflow.start_date]);

  const handleCategoryClose = async (
    updatedCategories: Tables<"finance_category">[] | null
  ) => {
    if (isLoading) return;
    closeCategoryPopover();
    if (updatedCategories) {
      setIsLoading(true);
      const success = await updateRecurringCashFlow({
        ...cashflow,
        categoryIds: updatedCategories.map((c) => c.id),
      });
      console.log(success);
      setIsLoading(false);
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
          <Text
            fw={700}
            c={cashflow.type === "expense" ? "red" : "green"}
            w={70}
          >
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
            categories={currentCategories ?? []}
            onPopoverOpen={openCategoryPopover}
            onPopoverClose={handleCategoryClose}
            showAddCategory={hovered}
          />
        </Group>
      </Group>
    </Card>
  );
}
