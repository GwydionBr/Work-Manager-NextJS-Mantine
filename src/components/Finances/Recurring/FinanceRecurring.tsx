"use client";

import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  Box,
  Table,
  Title,
  Stack,
  Group,
  Text,
  Card,
  Divider,
} from "@mantine/core";

import classes from "./FinanceRecurring.module.css";
import EditCashFlowButton from "../EditCashFlowButton";
import NewCashFlowButton from "../NewCashFlowButton";
import { formatDate, formatMoney } from "@/utils/formatFunctions";

export default function FinanceRecurring() {
  const { recurringCashFlows } = useFinanceStore();
  const { locale, defaultFinanceCurrency } = useSettingsStore();

  // Filter active and completed recurring cash flows
  const today = new Date();
  const activeCashFlows = recurringCashFlows.filter((cashFlow) => {
    if (!cashFlow.end_date) return true; // No end date = active
    const endDate = new Date(cashFlow.end_date);
    return endDate > today; // End date in the future = active
  });

  const activeExpenseSum = activeCashFlows
    .filter((cashFlow) => cashFlow.type === "expense")
    .reduce((sum, cashFlow) => {
      return sum + cashFlow.amount;
    }, 0);
  const activeIncomeSum = activeCashFlows
    .filter((cashFlow) => cashFlow.type === "income")
    .reduce((sum, cashFlow) => {
      return sum + cashFlow.amount;
    }, 0);
  const activeTotalSum = activeIncomeSum - activeExpenseSum;

  const completedCashFlows = recurringCashFlows.filter((cashFlow) => {
    if (!cashFlow.end_date) return false; // No end date = not completed
    const endDate = new Date(cashFlow.end_date);
    return endDate <= today; // End date in the past = completed
  });

  const futureCashFlows = recurringCashFlows.filter((cashFlow) => {
    const startDate = new Date(cashFlow.start_date);
    return startDate > today; // Start date in the future = future
  });

  const renderTable = (
    cashFlows: typeof recurringCashFlows,
    title: string,
    expenseSum?: number,
    incomeSum?: number,
    totalSum?: number,
    showEndDates: boolean = false,
    showStartDates: boolean = false
  ) => (
    <Box className={classes.financeRecurringContainer}>
      <Title order={3}>{title}</Title>
      {(expenseSum || incomeSum) && (
        <Card withBorder radius="md" p="md" my="md">
          <Stack>
            <Group justify="space-between">
              <Group gap="xs">
                <Text>{locale === "de-DE" ? "Ausgaben" : "Expense"}:</Text>
                <Text c="red" fw={700}>
                  {expenseSum ? expenseSum.toLocaleString(locale, {
                    style: "currency",
                    currency: defaultFinanceCurrency,
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  }) : 0}
                </Text>
              </Group>
              <Group gap="xs">
                <Text>{locale === "de-DE" ? "Einnahmen" : "Income"}:</Text>
                <Text c="green" fw={700}>
                  {incomeSum ? incomeSum.toLocaleString(locale, {
                    style: "currency",
                    currency: defaultFinanceCurrency,
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  }) : 0}
                </Text>
              </Group>
            </Group>
            <Divider />
            <Group justify="center">
              <Text>Total:</Text>
              <Text c={totalSum && totalSum > 0 ? "green" : "red"} fw={700}>
                {totalSum ? totalSum : 0}
              </Text>
            </Group>
          </Stack>
        </Card>
      )}

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Amount</Table.Th>
            <Table.Th>Type</Table.Th>
            <Table.Th>Interval</Table.Th>
            {showStartDates && <Table.Th>Start Date</Table.Th>}
            {showEndDates && <Table.Th>End Date</Table.Th>}
            <Table.Th></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {cashFlows.map((cashFlow) => (
            <Table.Tr key={cashFlow.id}>
              <Table.Td>{cashFlow.title}</Table.Td>
              <Table.Td>
                {formatMoney(cashFlow.amount, cashFlow.currency, locale)}
              </Table.Td>
              <Table.Td>{cashFlow.type === "expense" ? "Expense" : "Income"}</Table.Td>
              <Table.Td>{cashFlow.interval}</Table.Td>
              {showStartDates && (
                <Table.Td>
                  {cashFlow.start_date
                    ? formatDate(new Date(cashFlow.start_date), locale)
                    : "Unlimited"}
                </Table.Td>
              )}
              {showEndDates && (
                <Table.Td>
                  {cashFlow.end_date
                    ? formatDate(new Date(cashFlow.end_date), locale)
                    : "Unlimited"}
                </Table.Td>
              )}
              <Table.Td>
                <EditCashFlowButton cashFlow={cashFlow} />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Box>
  );

  return (
    <Stack gap="xl" align="center" mb="xl">
      <NewCashFlowButton
        isSingle={false}
        tooltipLabel="Add Recurring Cash Flow"
      />
      {renderTable(
        activeCashFlows,
        "Active",
        activeExpenseSum,
        activeIncomeSum,
        activeTotalSum,
        false,
        false
      )}
      {futureCashFlows.length > 0 &&
        renderTable(
          futureCashFlows,
          "Future",
          undefined,
          undefined,
          undefined,
          false,
          true
        )}
      {completedCashFlows.length > 0 &&
        renderTable(
          completedCashFlows,
          "Completed",
          undefined,
          undefined,
          undefined,
          true,
          false
        )}
    </Stack>
  );
}
