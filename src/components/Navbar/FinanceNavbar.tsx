"use client";

import { Group, ScrollArea, Stack, Text, Divider } from "@mantine/core";
import classes from "./Navbar.module.css";
import FinanceSection from "../Finances/FinanceSection";
import NewCashFlowButton from "../Finances/NewCashFlowButton";
import { useFinanceStore } from "@/stores/financeStore";
import { useEffect } from "react";

export default function FinanceNavbar() {
  const { singleCashFlows } = useFinanceStore();

  const incomeCashFlows = singleCashFlows.filter(
    (cashFlow) => cashFlow.type === "income"
  );
  const expenseCashFlows = singleCashFlows.filter(
    (cashFlow) => cashFlow.type === "expense"
  );

  return (
    <div className={classes.main}>
      <Group className={classes.title} align="center" justify="space-between">
        <Text>Finances</Text>
        <NewCashFlowButton />
      </Group>

      <ScrollArea className={classes.scrollArea}>
        <Stack className={classes.financeSections} gap={0}>
          <FinanceSection title="Income" cashFlows={incomeCashFlows} />
          <Divider className={classes.divider} />
          <FinanceSection title="Expenses" cashFlows={expenseCashFlows} />
        </Stack>
      </ScrollArea>
    </div>
  );
}
