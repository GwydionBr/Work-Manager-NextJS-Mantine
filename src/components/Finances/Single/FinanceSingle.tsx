"use client";

import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Box, Table, alpha } from "@mantine/core";
import EditCashFlowButton from "../EditCashFlowButton";
import NewCashFlowButton from "../NewCashFlowButton";

import classes from "./FinanceSingle.module.css";
import { formatDate, formatMoney } from "@/utils/formatFunctions";

export default function FinanceSingle() {
  const { singleCashFlows, financeCategories } = useFinanceStore();
  const { locale } = useSettingsStore();

  const sortedSingleCashFlows = singleCashFlows.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Box className={classes.financeSingleContainer} mb="md">
      <NewCashFlowButton isSingle={true} tooltipLabel="Add Single Cash Flow" />
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Date</Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th>Amount</Table.Th>
            <Table.Th>Category</Table.Th>
            <Table.Th></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {sortedSingleCashFlows.map((cashFlow) => {
            return (
              <Table.Tr
                key={cashFlow.id}
                bg={
                  cashFlow.type === "expense"
                    ? alpha("var(--mantine-color-red-5)", 0.4)
                    : alpha("var(--mantine-color-green-5)", 0.4)
                }
              >
                <Table.Td>
                  {formatDate(new Date(cashFlow.date), locale)}
                </Table.Td>
                <Table.Td>{cashFlow.title}</Table.Td>
                <Table.Td>
                  {formatMoney(cashFlow.amount, cashFlow.currency, locale)}
                </Table.Td>
                <Table.Td>
                  {
                    financeCategories.find(
                      (category) => category.id === cashFlow.category_id
                    )?.title
                  }
                </Table.Td>
                <Table.Td>
                  <EditCashFlowButton cashFlow={cashFlow} />
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Box>
  );
}
