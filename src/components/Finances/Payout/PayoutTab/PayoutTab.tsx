"use client";

import { useMemo, useState } from "react";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Stack, Group, ThemeIcon, Skeleton } from "@mantine/core";

import PayoutRowCard from "./PayoutRowCard";
import FinancesNavbar from "../../FinancesNavbar";
import AdjustmentActionIcon from "@/components/UI/ActionIcons/AdjustmentActionIcon";

import { SettingsTab } from "@/components/Settings/SettingsModal";
import { IconClock, IconList, IconMoneybag } from "@tabler/icons-react";
import { useWorkStore } from "@/stores/workManagerStore";
import { Payout } from "@/types/finance.types";

export default function PayoutTab() {
  const { payouts } = useFinanceStore();
  const { setIsModalOpen, setSelectedTab, locale } = useSettingsStore();
  const { singleCashFlows, isFetching: isFinanceFetching } = useFinanceStore();
  const {
    projects,
    timerSessions,
    isFetching: isWorkFetching,
  } = useWorkStore();
  const payoutData = useMemo<Payout[]>(() => {
    return payouts.map((payout) => ({
      ...payout,
      cashflow: payout.cashflow_id
        ? (singleCashFlows.find((flow) => flow.id === payout.cashflow_id) ??
          null)
        : null,
      timer_project: payout.timer_project_id
        ? (projects.find(
            (project) => project.project.id === payout.timer_project_id
          )?.project ?? null)
        : null,
      timer_sessions:
        timerSessions
          .map((session) => (session.payout_id === payout.id ? session : null))
          .filter((session) => session !== null) ?? [],
    }));
  }, [payouts, singleCashFlows, projects, timerSessions]);

  const [typeFilter, setTypeFilter] = useState<
    "all" | "project" | "session" | "financeProject"
  >("all");

  const navbarItems = useMemo(() => {
    return [
      [
        {
          label: locale === "de-DE" ? "Alle" : "All",
          leftSection: (
            <ThemeIcon variant="transparent" color="gray">
              <IconList />
            </ThemeIcon>
          ),
          active: typeFilter === "all",
          onClick: () => setTypeFilter("all"),
        },
        {
          label: locale === "de-DE" ? "Projekte" : "Projects",
          leftSection: (
            <ThemeIcon variant="transparent" color="blue">
              <IconList />
            </ThemeIcon>
          ),
          active: typeFilter === "project",
          onClick: () => setTypeFilter("project"),
        },
        {
          label: locale === "de-DE" ? "Sessions" : "Sessions",
          leftSection: (
            <ThemeIcon variant="transparent" color="blue">
              <IconClock />
            </ThemeIcon>
          ),
          active: typeFilter === "session",
          onClick: () => setTypeFilter("session"),
        },
        {
          label: locale === "de-DE" ? "Finance Projects" : "Finance Projects",
          leftSection: (
            <ThemeIcon variant="transparent" color="green">
              <IconMoneybag />
            </ThemeIcon>
          ),
          active: typeFilter === "financeProject",
          onClick: () => setTypeFilter("financeProject"),
        },
      ],
    ];
  }, [typeFilter]);

  return (
    <Group w="100%">
      <FinancesNavbar
        top={
          <Group justify="space-between">
            <AdjustmentActionIcon
              size="lg"
              tooltipLabel={
                locale === "de-DE"
                  ? "Finanz Einstellungen anpassen"
                  : "Adjust finance settings"
              }
              iconSize={20}
              onClick={() => {
                setIsModalOpen(true);
                setSelectedTab(SettingsTab.FINANCE);
              }}
            />
          </Group>
        }
        isNavbar
        navbarItems={navbarItems}
      />
      <Stack w="100%" mb="xl" ml={230}>
        {isFinanceFetching || isWorkFetching
          ? Array.from({ length: 3 }, (_, i) => (
              <Skeleton height={200} w="100%" key={i} />
            ))
          : payoutData.map((payout) => (
              <PayoutRowCard key={payout.id} payout={payout} />
            ))}
      </Stack>
    </Group>
  );
}
