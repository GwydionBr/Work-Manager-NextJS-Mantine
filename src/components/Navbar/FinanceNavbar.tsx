"use client";

import { useFinanceStore } from "@/stores/financeStore";

import { Group, ScrollArea, Stack, Text, Divider, Box } from "@mantine/core";
import FinanceSection from "../Finances/FinanceSection";
import NewCashFlowButton from "../Finances/NewCashFlowButton";

import classes from "./Navbar.module.css";

export default function FinanceNavbar() {
  const { singleCashFlows } = useFinanceStore();

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
        <NewCashFlowButton />
      </Group>
      {(incomeCashFlows.length > 0 || expenseCashFlows.length > 0) && (
        <ScrollArea className={classes.scrollArea}>
          <Stack className={classes.financeSections} gap={0}>
            <FinanceSection title="Income" cashFlows={incomeCashFlows} />
            <Divider className={classes.divider} />
            <FinanceSection title="Expenses" cashFlows={expenseCashFlows} />
          </Stack>
        </ScrollArea>
      )}
    </Box>
  );
}
