"use client";

import { useFinanceStore } from "@/stores/financeStore";

import { Box } from "@mantine/core";
import FinanceInitializer from "@/components/Finances/FinanceInitializer";

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isFetching, singleCashFlows, recurringCashFlows } = useFinanceStore();

  if (
    !isFetching &&
    singleCashFlows.length === 0 &&
    recurringCashFlows.length === 0
  ) {
    return <FinanceInitializer />;
  }

  return (
    <Box>
      <Box
        style={{ transition: "margin 0.4s ease-in-out" }}
      >
        {children}
      </Box>
    </Box>
  );
}
