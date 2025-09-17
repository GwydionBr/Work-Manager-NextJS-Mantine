"use client";

import { Card, NavLink, Text } from "@mantine/core";
import { IconCalendarEvent, IconList, IconSquareRoundedCheck } from "@tabler/icons-react";
import { TotalAmounts } from "./FinanceProjects";
import { useSettingsStore } from "@/stores/settingsStore";
import { formatMoney } from "@/utils/formatFunctions";

export enum FinanceProjectNavbarTab {
  Upcoming = "upcoming",
  Overdue = "overdue",
  Paid = "paid",
  All = "all",
}

interface FinanceProjectNavbarProps {
  tab: FinanceProjectNavbarTab;
  setTab: (tab: FinanceProjectNavbarTab) => void;
  totalAmounts: TotalAmounts;
}

export default function FinanceProjectNavbar({
  tab,
  setTab,
  totalAmounts,
}: FinanceProjectNavbarProps) {
  const { locale } = useSettingsStore();
  return (
    <Card withBorder p="md" w={200} radius="lg">
      <NavLink
        label="All"
        leftSection={<IconList />}
        description={<Text size="sm">{formatMoney(totalAmounts.totalAmount, "EUR", locale)}</Text>}
        active={tab === FinanceProjectNavbarTab.All}
        onClick={() => setTab(FinanceProjectNavbarTab.All)}
      />
      <NavLink
        label="Upcoming"
        leftSection={<IconCalendarEvent color="light-dark(var(--mantine-color-blue-6), var(--mantine-color-blue-5))" />}
        description={<Text size="sm">{formatMoney(totalAmounts.upcomingTotalAmount, "EUR", locale)}</Text>}
        active={tab === FinanceProjectNavbarTab.Upcoming}
        onClick={() => setTab(FinanceProjectNavbarTab.Upcoming)}
      />
      <NavLink
        label="Overdue"
        leftSection={<IconCalendarEvent color="light-dark(var(--mantine-color-red-6), var(--mantine-color-red-5))" />}
        description={<Text size="sm">{formatMoney(totalAmounts.overdueTotalAmount, "EUR", locale)}</Text>}
        active={tab === FinanceProjectNavbarTab.Overdue}
        onClick={() => setTab(FinanceProjectNavbarTab.Overdue)}
      />
      <NavLink
        label="Paid"
        leftSection={<IconSquareRoundedCheck color="light-dark(var(--mantine-color-green-6), var(--mantine-color-green-5))" />}
        description={<Text size="sm">{formatMoney(totalAmounts.paidTotalAmount, "EUR", locale)}</Text>}
        active={tab === FinanceProjectNavbarTab.Paid}
        onClick={() => setTab(FinanceProjectNavbarTab.Paid)}
      />
    </Card>
  );
}
