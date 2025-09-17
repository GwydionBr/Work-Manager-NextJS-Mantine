"use client";

import { Card, NavLink } from "@mantine/core";
import { IconCalendarEvent, IconList, IconSquareRoundedCheck } from "@tabler/icons-react";

export enum FinanceProjectNavbarTab {
  Upcoming = "upcoming",
  Overdue = "overdue",
  Paid = "paid",
  All = "all",
}

interface FinanceProjectNavbarProps {
  tab: FinanceProjectNavbarTab;
  setTab: (tab: FinanceProjectNavbarTab) => void;
}

export default function FinanceProjectNavbar({
  tab,
  setTab,
}: FinanceProjectNavbarProps) {
  return (
    <Card withBorder p="md" w={200} radius="lg">
      <NavLink
        label="All"
        leftSection={<IconList />}
        active={tab === FinanceProjectNavbarTab.All}
        onClick={() => setTab(FinanceProjectNavbarTab.All)}
      />
      <NavLink
        label="Upcoming"
        leftSection={<IconCalendarEvent color="blue" />}
        active={tab === FinanceProjectNavbarTab.Upcoming}
        onClick={() => setTab(FinanceProjectNavbarTab.Upcoming)}
      />
      <NavLink
        label="Overdue"
        leftSection={<IconCalendarEvent color="red" />}
        active={tab === FinanceProjectNavbarTab.Overdue}
        onClick={() => setTab(FinanceProjectNavbarTab.Overdue)}
      />
      <NavLink
        label="Paid"
        leftSection={<IconSquareRoundedCheck color="green" />}
        active={tab === FinanceProjectNavbarTab.Paid}
        onClick={() => setTab(FinanceProjectNavbarTab.Paid)}
      />
    </Card>
  );
}
