"use client";

import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Group, Text, Divider, Box } from "@mantine/core";
import FinanceSection from "@/components/Finances/FinanceSection";
import NewCashFlowButton from "@/components/Finances/NewCashFlowButton";
import AdjustmentActionIcon from "@/components/UI/ActionIcons/AdjustmentActionIcon";

import classes from "./Navbar.module.css";
import { SettingsTab } from "../Settings/SettingsModal";

export default function FinanceNavbar() {
  const { singleCashFlows, isFetching } = useFinanceStore();
  const { setSelectedTab, setIsModalOpen } = useSettingsStore();

  const incomeCashFlows = singleCashFlows.filter(
    (cashFlow) => cashFlow.type === "income"
  );

  const expenseCashFlows = singleCashFlows.filter(
    (cashFlow) => cashFlow.type === "expense"
  );

  return (
    <Box className={classes.main} w="250px">
      <Group className={classes.title} align="center" justify="space-between">
        <Text>Finances</Text>
        {!isFetching && (
          <Group gap={8}>
            <AdjustmentActionIcon
              aria-label="Adjust finance settings"
              tooltipLabel="Adjust finance settings"
              size="md"
              iconSize={20}
              onClick={() => {
                setIsModalOpen(true);
                setSelectedTab(SettingsTab.FINANCE);
              }}
            />
            <NewCashFlowButton />
          </Group>
        )}
      </Group>
      <Box className={classes.financeSections}>
        <FinanceSection
          title="Income"
          cashFlows={incomeCashFlows}
          isFetching={isFetching}
        />
        <Divider className={classes.divider} />
        <FinanceSection
          title="Expenses"
          cashFlows={expenseCashFlows}
          isFetching={isFetching}
        />
      </Box>
    </Box>
  );
}
