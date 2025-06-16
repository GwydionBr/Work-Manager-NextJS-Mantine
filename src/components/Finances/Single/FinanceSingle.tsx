"use client";

import { useFinanceStore } from "@/stores/financeStore";

import { Box, Table } from "@mantine/core";

import classes from "./FinanceSingle.module.css";

export default function FinanceSingle() {
  const { singleCashFlows, financeCategories } = useFinanceStore();

  const sortedSingleCashFlows = singleCashFlows.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Box className={classes.financeSingleContainer}>
      <Table striped>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Date</Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th>Amount</Table.Th>
            <Table.Th>Type</Table.Th>
            <Table.Th>Category</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {sortedSingleCashFlows.map((cashFlow) => (
            <Table.Tr key={cashFlow.id}>
              <Table.Td>{cashFlow.date}</Table.Td>
              <Table.Td>{cashFlow.title}</Table.Td>
              <Table.Td>{cashFlow.amount}</Table.Td>
              <Table.Td>{cashFlow.type}</Table.Td>
              <Table.Td>
                {
                  financeCategories.find(
                    (category) => category.id === cashFlow.category_id
                  )?.title
                }
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Box>
  );
}
