"use client";

import { useFinanceStore } from "@/stores/financeStore";

import { Box } from "@mantine/core";
import FinanceNavbar from "@/components/Navbar/FinanceNavbar";
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
      <FinanceNavbar />
      <Box ml="250px">{children}</Box>
    </Box>
  );
}
