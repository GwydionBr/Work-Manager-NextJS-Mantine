"use client";

import { useMemo, useState } from "react";
import { useSettingsStore } from "@/stores/settingsStore";

import { Stack, Group, ThemeIcon, Skeleton } from "@mantine/core";

import PayoutRowCard from "./PayoutRowCard";
import FinancesNavbar from "../../FinancesNavbar";
import AdjustmentActionIcon from "@/components/UI/ActionIcons/AdjustmentActionIcon";

import { SettingsTab } from "@/components/Settings/SettingsModal";
import {
  IconClock,
  IconFolder,
  IconList,
  IconMoneybag,
} from "@tabler/icons-react";
import { useWorkStore } from "@/stores/workManagerStore";
import { useSingleCashflowQuery } from "@/utils/queries/finances/use-single-cashflow";
import { Payout } from "@/types/finance.types";

export default function PayoutTab() {
  const { setIsModalOpen, setSelectedTab, getLocalizedText } =
    useSettingsStore();

  // TODO: Add payouts
  const payouts: Payout[] = [];
  const { data: singleCashFlows = [], isPending: isSingleCashFlowsPending } =
    useSingleCashflowQuery();
  const {
    projects,
    timerSessions,
    isFetching: isWorkFetching,
  } = useWorkStore();
  const [typeFilter, setTypeFilter] = useState<
    "all" | "project" | "session" | "financeProject"
  >("all");

  const payoutData = useMemo<Payout[]>(() => {
    return payouts.map((payout) => ({
      ...payout,
      cashflow: payout.cashflow_id
        ? (singleCashFlows.find((flow) => flow.id === payout.cashflow_id) ??
          null)
        : null,
      timer_project: payout.timer_project_id
        ? (projects.find((project) => project.id === payout.timer_project_id) ??
          null)
        : null,
      timer_sessions:
        timerSessions
          .map((session) => (session.payout_id === payout.id ? session : null))
          .filter((session) => session !== null) ?? [],
      timer_session_project: payout.timer_session_project_id
        ? (projects.find(
            (project) => project.id === payout.timer_session_project_id
          ) ?? null)
        : null,
    }));
  }, [payouts, singleCashFlows, projects, timerSessions]);

  const filteredPayoutData = useMemo(() => {
    return payoutData.filter((payout) => {
      if (typeFilter === "all") return true;
      if (typeFilter === "project") return payout.timer_project !== null;
      if (typeFilter === "session") return payout.timer_sessions.length > 0;
      if (typeFilter === "financeProject")
        return payout.finance_project_id !== null;
    });
  }, [payoutData, typeFilter]);

  const navbarItems = useMemo(() => {
    return [
      [
        {
          label: getLocalizedText("Alle", "All"),
          leftSection: (
            <ThemeIcon variant="transparent" color="gray">
              <IconList />
            </ThemeIcon>
          ),
          active: typeFilter === "all",
          onClick: () => setTypeFilter("all"),
          disabled: payoutData.length === 0,
        },
        {
          label: getLocalizedText("Projekte", "Projects"),
          leftSection: (
            <ThemeIcon variant="transparent" color="grape">
              <IconFolder />
            </ThemeIcon>
          ),
          active: typeFilter === "project",
          onClick: () => setTypeFilter("project"),
          disabled:
            payoutData.filter((payout) => payout.timer_project !== null)
              .length === 0,
        },
        {
          label: getLocalizedText("Sessions", "Sessions"),
          leftSection: (
            <ThemeIcon variant="transparent" color="yellow">
              <IconClock />
            </ThemeIcon>
          ),
          active: typeFilter === "session",
          onClick: () => setTypeFilter("session"),
          disabled:
            payoutData.filter((payout) => payout.timer_sessions.length > 0)
              .length === 0,
        },
        {
          label: getLocalizedText("Finance Projects", "Finance Projects"),
          leftSection: (
            <ThemeIcon variant="transparent" color="green">
              <IconMoneybag />
            </ThemeIcon>
          ),
          active: typeFilter === "financeProject",
          onClick: () => setTypeFilter("financeProject"),
          disabled:
            payoutData.filter((payout) => payout.finance_project_id !== null)
              .length === 0,
        },
      ],
    ];
  }, [typeFilter, payoutData]);

  return (
    <Group w="100%">
      <FinancesNavbar
        top={
          <Group justify="space-between">
            <AdjustmentActionIcon
              size="lg"
              tooltipLabel={getLocalizedText(
                "Finanz Einstellungen anpassen",
                "Adjust finance settings"
              )}
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
        {isSingleCashFlowsPending || isWorkFetching
          ? Array.from({ length: 3 }, (_, i) => (
              <Skeleton height={200} w="100%" key={i} radius="md" />
            ))
          : filteredPayoutData.map((payout) => (
              <PayoutRowCard key={payout.id} payout={payout} />
            ))}
      </Stack>
    </Group>
  );
}
