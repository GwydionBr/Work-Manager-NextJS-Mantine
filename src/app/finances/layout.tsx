"use client";

import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Box } from "@mantine/core";
import FinanceNavbar from "@/components/Navbar/FinanceNavbar";
import FinanceInitializer from "@/components/Finances/FinanceInitializer";

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isFetching, singleCashFlows, recurringCashFlows } = useFinanceStore();

  const { isFinanceNavbarOpen } = useSettingsStore();

  if (
    !isFetching &&
    singleCashFlows.length === 0 &&
    recurringCashFlows.length === 0
  ) {
    return <FinanceInitializer />;
  }

  return (
    <Box>
      {/* <FinanceNavbar /> */}
      <Box
        // ml={isFinanceNavbarOpen ? 250 : 60}
        style={{ transition: "margin 0.4s ease-in-out" }}
      >
        {children}
      </Box>
    </Box>
  );
}
