"use client";

import { useFormatter } from "@/hooks/useFormatter";

import { Card, CardProps, Divider, NavLink, Text } from "@mantine/core";
import {
  IconCalendarEvent,
  IconList,
  IconSquareRoundedCheck,
} from "@tabler/icons-react";

import { FinanceNavbarItems } from "@/types/finance.types";

export enum FinanceProjectNavbarTab {
  Upcoming = "upcoming",
  Overdue = "overdue",
  Paid = "paid",
  All = "all",
}

interface FinanceProjectNavbarProps extends CardProps {
  tab: FinanceProjectNavbarTab;
  setTab: (tab: FinanceProjectNavbarTab) => void;
  items: FinanceNavbarItems;
}

export default function FinanceProjectNavbar({
  tab,
  setTab,
  items,
  ...props
}: FinanceProjectNavbarProps) {
  const { getLocalizedText, formatMoney } = useFormatter();
  return (
    <Card withBorder shadow="sm" p="md" w={200} miw={190} radius="lg" {...props}>
      <NavLink
        label={getLocalizedText("Alle", "All")}
        leftSection={<IconList />}
        description={
          <Text size="sm">
            {formatMoney(items.all.totalAmount, "EUR")} (
            {items.all.projectCount})
          </Text>
        }
        active={tab === FinanceProjectNavbarTab.All}
        onClick={() => setTab(FinanceProjectNavbarTab.All)}
        disabled={items.all.projectCount === 0}
      />
      <NavLink
        label={getLocalizedText("Bevorstehend", "Upcoming")}
        leftSection={
          <IconCalendarEvent color="light-dark(var(--mantine-color-blue-6), var(--mantine-color-blue-5))" />
        }
        description={
          <Text size="sm">
            {formatMoney(items.upcoming.totalAmount, "EUR")} (
            {items.upcoming.projectCount})
          </Text>
        }
        active={tab === FinanceProjectNavbarTab.Upcoming}
        onClick={() => setTab(FinanceProjectNavbarTab.Upcoming)}
        disabled={items.upcoming.projectCount === 0}
      />
      <NavLink
        label={getLocalizedText("Überfällig", "Overdue")}
        leftSection={
          <IconCalendarEvent color="light-dark(var(--mantine-color-red-6), var(--mantine-color-red-5))" />
        }
        description={
          <Text size="sm">
            {formatMoney(items.overdue.totalAmount, "EUR")} (
            {items.overdue.projectCount})
          </Text>
        }
        active={tab === FinanceProjectNavbarTab.Overdue}
        onClick={() => setTab(FinanceProjectNavbarTab.Overdue)}
        disabled={items.overdue.projectCount === 0}
      />
      <Divider />
      <NavLink
        label={getLocalizedText("Bezahlt", "Paid")}
        leftSection={
          <IconSquareRoundedCheck color="light-dark(var(--mantine-color-green-6), var(--mantine-color-green-5))" />
        }
        description={
          <Text size="sm">
            {formatMoney(items.paid.totalAmount, "EUR")} (
            {items.paid.projectCount})
          </Text>
        }
        active={tab === FinanceProjectNavbarTab.Paid}
        onClick={() => setTab(FinanceProjectNavbarTab.Paid)}
        disabled={items.paid.projectCount === 0}
      />
    </Card>
  );
}
