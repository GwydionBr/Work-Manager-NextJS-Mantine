"use client";

import { useDisclosure } from "@mantine/hooks";
import { useFinanceStore } from "@/stores/financeStore";

import { Group, Text, Divider, Box, ActionIcon, Modal } from "@mantine/core";
import { IconAdjustments } from "@tabler/icons-react";
import FinanceAdjustments from "@/components/Finances/FinanceSettings/FinanceSettings";
import FinanceSection from "@/components/Finances/FinanceSection";
import NewCashFlowButton from "@/components/Finances/NewCashFlowButton";

import classes from "./Navbar.module.css";

export default function FinanceNavbar() {
  const { singleCashFlows, isFetching } = useFinanceStore();
  const [opened, { open, close }] = useDisclosure(false);

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
          <Group>
            <ActionIcon variant="subtle" size="md" onClick={open}>
              <IconAdjustments size={20} />
            </ActionIcon>
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
      <Modal opened={opened} onClose={close} title="Finance Manager" size="70%">
        <FinanceAdjustments onClose={close} />
      </Modal>
    </Box>
  );
}
