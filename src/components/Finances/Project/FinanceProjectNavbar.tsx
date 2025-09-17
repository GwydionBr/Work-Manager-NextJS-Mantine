"use client";

import { useSettingsStore } from "@/stores/settingsStore";

import { Card, NavLink, Text } from "@mantine/core";
import { IconCalendarEvent, IconList, IconSquareRoundedCheck } from "@tabler/icons-react";

import { formatMoney } from "@/utils/formatFunctions";
import { FinanceNavbarItems } from "@/types/finance.types";

export enum FinanceProjectNavbarTab {
  Upcoming = "upcoming",
  Overdue = "overdue",
  Paid = "paid",
  All = "all",
}

interface FinanceProjectNavbarProps {
  tab: FinanceProjectNavbarTab;
  setTab: (tab: FinanceProjectNavbarTab) => void;
  items: FinanceNavbarItems;
}

export default function FinanceProjectNavbar({
  tab,
  setTab,
  items,
}: FinanceProjectNavbarProps) {
  const { locale } = useSettingsStore();
  return (
    <Card withBorder p="md" w={200} radius="lg">
      <NavLink
        label={locale === "de-DE" ? "Alle" : "All"}
        leftSection={<IconList />}
        description={<Text size="sm">{formatMoney(items.all.totalAmount, "EUR", locale)} ({items.all.projectCount})</Text>}
        active={tab === FinanceProjectNavbarTab.All}
        onClick={() => setTab(FinanceProjectNavbarTab.All)}
        disabled={items.all.projectCount === 0}
      />
      <NavLink
        label={locale === "de-DE" ? "Bevorstehend" : "Upcoming"}
        leftSection={<IconCalendarEvent color="light-dark(var(--mantine-color-blue-6), var(--mantine-color-blue-5))" />}
        description={<Text size="sm">{formatMoney(items.upcoming.totalAmount, "EUR", locale)} ({items.upcoming.projectCount})</Text>}
        active={tab === FinanceProjectNavbarTab.Upcoming}
        onClick={() => setTab(FinanceProjectNavbarTab.Upcoming)}
        disabled={items.upcoming.projectCount === 0}
      />
      <NavLink
        label={locale === "de-DE" ? "Überfällig" : "Overdue"}
        leftSection={<IconCalendarEvent color="light-dark(var(--mantine-color-red-6), var(--mantine-color-red-5))" />}
        description={<Text size="sm">{formatMoney(items.overdue.totalAmount, "EUR", locale)} ({items.overdue.projectCount})</Text>}
        active={tab === FinanceProjectNavbarTab.Overdue}
        onClick={() => setTab(FinanceProjectNavbarTab.Overdue)}
        disabled={items.overdue.projectCount === 0}
      />
      <NavLink
        label={locale === "de-DE" ? "Bezahlt" : "Paid"}
        leftSection={<IconSquareRoundedCheck color="light-dark(var(--mantine-color-green-6), var(--mantine-color-green-5))" />}
        description={<Text size="sm">{formatMoney(items.paid.totalAmount, "EUR", locale)} ({items.paid.projectCount})</Text>}
        active={tab === FinanceProjectNavbarTab.Paid}
        onClick={() => setTab(FinanceProjectNavbarTab.Paid)}
        disabled={items.paid.projectCount === 0}
      />
    </Card>
  );
}
