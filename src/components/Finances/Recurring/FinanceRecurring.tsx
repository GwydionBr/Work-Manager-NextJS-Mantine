"use client";

import { useFinanceStore } from "@/stores/financeStore";

import { Box, Table, Title, Stack, Group, Text, Card } from "@mantine/core";

import classes from "./FinanceRecurring.module.css";
import EditCashFlowButton from "../EditCashFlowButton";
import NewCashFlowButton from "../NewCashFlowButton";

export default function FinanceRecurring() {
  const { recurringCashFlows } = useFinanceStore();

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
    showEndDates: boolean = false,
    showStartDates: boolean = false
  ) => (
    <Box className={classes.financeRecurringContainer}>
      <Title order={3} mb="md">
        {title}
      </Title>
      {(expenseSum || incomeSum) && (
        <Card withBorder radius="md" p="md">
          <Group justify="space-between">
            {expenseSum && (
              <Group gap="xs">
                <Text>Expense Sum:</Text>
                <Text c="red" fw={700}>
                  {expenseSum}
                </Text>
              </Group>
            )}
            {incomeSum && (
              <Group gap="xs">
                <Text>Income Sum:</Text>
                <Text c="green" fw={700}>
                  {incomeSum}
                </Text>
              </Group>
            )}
          </Group>
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
              <Table.Td>{cashFlow.amount}</Table.Td>
              <Table.Td>{cashFlow.type}</Table.Td>
              <Table.Td>{cashFlow.interval}</Table.Td>
              {showStartDates && (
                <Table.Td>
                  {cashFlow.start_date
                    ? new Date(cashFlow.start_date).toLocaleDateString()
                    : "Unlimited"}
                </Table.Td>
              )}
              {showEndDates && (
                <Table.Td>
                  {cashFlow.end_date
                    ? new Date(cashFlow.end_date).toLocaleDateString()
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
    <Stack gap="xl" align="center">
      <NewCashFlowButton
        isSingle={false}
        tooltipLabel="Add Recurring Cash Flow"
      />
      {renderTable(
        activeCashFlows,
        "Active",
        activeExpenseSum,
        activeIncomeSum,
        false,
        false
      )}
      {futureCashFlows.length > 0 &&
        renderTable(
          futureCashFlows,
          "Future",
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
          true,
          false
        )}
    </Stack>
  );
}
