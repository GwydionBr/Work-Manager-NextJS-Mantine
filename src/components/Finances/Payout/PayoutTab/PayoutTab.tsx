"use client";

import { useMemo } from "react";
import { useSettingsStore } from "@/stores/settingsStore";

import { Stack, Group, Skeleton } from "@mantine/core";

import PayoutRowCard from "./PayoutRowCard";
import FinancesNavbar from "../../FinancesNavbar/FinancesNavbar";
import AdjustmentActionIcon from "@/components/UI/ActionIcons/AdjustmentActionIcon";

import { SettingsTab } from "@/components/Settings/SettingsModal";
import { useSingleCashflowQuery } from "@/utils/queries/finances/use-single-cashflow";
import { Payout } from "@/types/finance.types";
import { useWorkProjectQuery } from "@/utils/queries/work/use-work-project";
import { useWorkTimeEntryQuery } from "@/utils/queries/work/use-work-time_entry";
import FinancesNavbarToolbar from "../../FinancesNavbar/FinancesNavbarToolbar";
import { usePayoutQuery } from "@/utils/queries/finances/use-payout";

export default function PayoutTab() {
  const { setIsModalOpen, setSelectedTab, getLocalizedText } =
    useSettingsStore();

  const { data: payouts = [], isPending: isPayoutsPending } = usePayoutQuery();
  const { data: singleCashFlows = [], isPending: isSingleCashFlowsPending } =
    useSingleCashflowQuery();
  const { data: projects = [], isPending: isProjectPending } =
    useWorkProjectQuery();
  const { data: timerSessions = [], isPending: isTimeEntryPending } =
    useWorkTimeEntryQuery();

  const payoutData = useMemo<Payout[]>(() => {
    return payouts.map((payout) => ({
      ...payout,
      cashflow:
        singleCashFlows.find((flow) => flow.payout_id === payout.id) ?? null,
      timer_project: payout.timer_project_id
        ? (projects.find((project) => project.id === payout.timer_project_id) ??
          null)
        : null,
      timer_sessions:
        timerSessions
          .map((session) => (session.payout_id === payout.id ? session : null))
          .filter((session) => session !== null) ?? [],
    }));
  }, [payouts, singleCashFlows, projects, timerSessions]);

  return (
    <Group w="100%">
      <FinancesNavbar
        items={[
          <FinancesNavbarToolbar
            key="payout-toolbar"
            toolbarItems={[
              <AdjustmentActionIcon
                key="payout-adjustment-action-icon"
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
              />,
            ]}
          />,
        ]}
      />
      <Stack w="100%" mb="xl" ml={230}>
        {isPayoutsPending ||
        isSingleCashFlowsPending ||
        isProjectPending ||
        isTimeEntryPending
          ? Array.from({ length: 3 }, (_, i) => (
              <Skeleton height={200} w="100%" key={i} radius="md" />
            ))
          : payoutData.map((payout) => (
              <PayoutRowCard key={payout.id} payout={payout} />
            ))}
      </Stack>
    </Group>
  );
}
