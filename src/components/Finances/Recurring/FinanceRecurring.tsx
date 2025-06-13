"use client";

import { useFinanceStore } from "@/stores/financeStore";

import { Box, Table } from "@mantine/core";

import classes from "./FinanceRecurring.module.css";

export default function FinanceRecurring() {
  const { recurringCashFlows } = useFinanceStore();

  return (
    <Box className={classes.financeRecurringContainer}>
      <Table striped>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Amount</Table.Th>
            <Table.Th>Type</Table.Th>
            <Table.Th>Interval</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {recurringCashFlows.map((cashFlow) => (
            <Table.Tr key={cashFlow.id}>
              <Table.Td>{cashFlow.title}</Table.Td>
              <Table.Td>{cashFlow.amount}</Table.Td>
              <Table.Td>{cashFlow.type}</Table.Td>
              <Table.Td>{cashFlow.interval}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Box>
  );
}
