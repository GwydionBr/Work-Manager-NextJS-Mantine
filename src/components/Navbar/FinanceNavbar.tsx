"use client";

import { Group, ScrollArea, Stack, Text, Divider } from "@mantine/core";
import classes from "./Navbar.module.css";
import FinanceSection from "../Finances/FinanceSection";
import NewCashFlowButton from "../Finances/NewCashFlowButton";

export default function FinanceNavbar() {
  return (
    <div className={classes.main}>
      <Group className={classes.title} align="center" justify="space-between">
        <Text>Finances</Text>
        <NewCashFlowButton />
      </Group>

      <ScrollArea className={classes.scrollArea}>
        <Stack className={classes.financeSections} gap={0}>
          <FinanceSection title="Income" />
          <Divider className={classes.divider} />
          <FinanceSection title="Expenses" />
        </Stack>
      </ScrollArea>
    </div>
  );
}
