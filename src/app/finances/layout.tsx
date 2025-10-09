"use client";

import { useSingleCashflowQuery } from "@/utils/queries/finances/use-single-cashflow";
import { useRecurringCashflowQuery } from "@/utils/queries/finances/use-recurring-cashflow";

import { Box } from "@mantine/core";
import FinanceInitializer from "@/components/Finances/FinanceInitializer";

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: singleCashFlows, isPending: isSingleCashFlowsPending } =
    useSingleCashflowQuery();
  const { data: recurringCashFlows, isPending: isRecurringCashFlowsPending } =
    useRecurringCashflowQuery();

  if (
    !isSingleCashFlowsPending &&
    !isRecurringCashFlowsPending &&
    singleCashFlows?.length === 0 &&
    recurringCashFlows?.length === 0
  ) {
    return <FinanceInitializer />;
  }

  return (
    <Box>
      <Box style={{ transition: "margin 0.4s ease-in-out" }}>{children}</Box>
    </Box>
  );
}
