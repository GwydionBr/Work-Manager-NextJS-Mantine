"use client";

import { useState, useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  Table,
  Title,
  Stack,
  Group,
  Text,
  Card,
  Divider,
  ActionIcon,
} from "@mantine/core";

import EditCashFlowButton from "@/components/Finances/CashFlow/EditCashFlowDrawer";
import CashFlowModal from "@/components/Finances/CashFlow/CashFlowModal";
import { formatDate, formatMoney } from "@/utils/formatFunctions";
import { FinanceInterval } from "@/types/settings.types";
import EditActionIcon from "@/components/UI/ActionIcons/EditActionIcon";
import { Tables } from "@/types/db.types";
import DelayedTooltip from "@/components/UI/DelayedTooltip";
import { IconCashPlus } from "@tabler/icons-react";

export default function FinanceRecurringTab() {
  const { recurringCashFlows } = useFinanceStore();
  const { locale, defaultFinanceCurrency } = useSettingsStore();
  const [selectedCashFlow, setSelectedCashFlow] =
    useState<Tables<"recurring_cash_flow"> | null>(null);
  const [
    editCashFlowOpened,
    { open: openEditCashFlow, close: closeEditCashFlow },
  ] = useDisclosure(false);
  const [
    cashFlowModalOpened,
    { open: openCashFlowModal, close: closeCashFlowModal },
  ] = useDisclosure(false);
  useEffect(() => {
    if (recurringCashFlows.length > 0) {
      setSelectedCashFlow(recurringCashFlows[0]);
    }
  }, [recurringCashFlows]);
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

  function getIntervalLabel(interval: FinanceInterval) {
    switch (interval) {
      case "day":
        return locale === "de-DE" ? "Täglich" : "Daily";
      case "week":
        return locale === "de-DE" ? "Wöchentlich" : "Weekly";
      case "month":
        return locale === "de-DE" ? "Monatlich" : "Monthly";
      case "1/4 year":
        return locale === "de-DE" ? "Vierteljährlich" : "Quarterly";
      case "1/2 year":
        return locale === "de-DE" ? "Halbjährlich" : "Half Yearly";
      case "year":
        return locale === "de-DE" ? "Jährlich" : "Yearly";
    }
  }

  const renderTable = (
    cashFlows: typeof recurringCashFlows,
    title: string,
    expenseSum?: number,
    incomeSum?: number,
    totalSum?: number,
    showEndDates: boolean = false,
    showStartDates: boolean = false
  ) => (
    <Stack align="center" w="100%">
      <Title order={3}>{title}</Title>
      {(expenseSum || incomeSum) && (
        <Card withBorder radius="md" p="md" my="md">
          <Stack>
            <Group justify="space-between">
              <Group gap="xs">
                <Text>{locale === "de-DE" ? "Ausgaben" : "Expense"}:</Text>
                <Text c="red" fw={700}>
                  {expenseSum
                    ? expenseSum.toLocaleString(locale, {
                        style: "currency",
                        currency: defaultFinanceCurrency,
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })
                    : 0}
                </Text>
              </Group>
              <Group gap="xs">
                <Text>{locale === "de-DE" ? "Einnahmen" : "Income"}:</Text>
                <Text c="green" fw={700}>
                  {incomeSum
                    ? incomeSum.toLocaleString(locale, {
                        style: "currency",
                        currency: defaultFinanceCurrency,
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })
                    : 0}
                </Text>
              </Group>
            </Group>
            <Divider />
            <Group justify="center">
              <Text>{locale === "de-DE" ? "Gesamt" : "Total"}:</Text>
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
            <Table.Th>{locale === "de-DE" ? "Name" : "Name"}</Table.Th>
            <Table.Th>{locale === "de-DE" ? "Betrag" : "Amount"}</Table.Th>
            <Table.Th>{locale === "de-DE" ? "Typ" : "Type"}</Table.Th>
            <Table.Th>{locale === "de-DE" ? "Intervall" : "Interval"}</Table.Th>
            {showStartDates && (
              <Table.Th>
                {locale === "de-DE" ? "Startdatum" : "Start Date"}
              </Table.Th>
            )}
            {showEndDates && (
              <Table.Th>
                {locale === "de-DE" ? "Enddatum" : "End Date"}
              </Table.Th>
            )}
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
              <Table.Td>
                {cashFlow.type === "expense"
                  ? locale === "de-DE"
                    ? "Ausgabe"
                    : "Expense"
                  : locale === "de-DE"
                    ? "Einnahme"
                    : "Income"}
              </Table.Td>
              <Table.Td>{getIntervalLabel(cashFlow.interval)}</Table.Td>
              {showStartDates && (
                <Table.Td>
                  {cashFlow.start_date
                    ? formatDate(new Date(cashFlow.start_date), locale)
                    : locale === "de-DE"
                      ? "Unbegrenzt"
                      : "Unlimited"}
                </Table.Td>
              )}
              {showEndDates && (
                <Table.Td>
                  {cashFlow.end_date
                    ? formatDate(new Date(cashFlow.end_date), locale)
                    : locale === "de-DE"
                      ? "Unbegrenzt"
                      : "Unlimited"}
                </Table.Td>
              )}
              <Table.Td>
                <EditActionIcon
                  onClick={() => {
                    setSelectedCashFlow(cashFlow);
                    openEditCashFlow();
                  }}
                />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      {selectedCashFlow && (
        <EditCashFlowButton
          cashFlow={selectedCashFlow}
          opened={editCashFlowOpened}
          onClose={closeEditCashFlow}
        />
      )}
    </Stack>
  );

  return (
    <Stack gap="xl" align="center" mb="xl">
      <DelayedTooltip
        label={
          locale === "de-DE"
            ? "Wiederkehrenden Cashflow hinzufügen"
            : "Add Recurring Cash Flow"
        }
      >
        <ActionIcon onClick={openCashFlowModal} variant="subtle">
          <IconCashPlus />
        </ActionIcon>
      </DelayedTooltip>
      <CashFlowModal
        opened={cashFlowModalOpened}
        onClose={closeCashFlowModal}
        isSingle={false}
      />
      {renderTable(
        activeCashFlows,
        locale === "de-DE" ? "Aktiv" : "Active",
        activeExpenseSum,
        activeIncomeSum,
        activeTotalSum,
        false,
        false
      )}
      {futureCashFlows.length > 0 &&
        renderTable(
          futureCashFlows,
          locale === "de-DE" ? "Zukünftig" : "Future",
          undefined,
          undefined,
          undefined,
          false,
          true
        )}
      {completedCashFlows.length > 0 &&
        renderTable(
          completedCashFlows,
          locale === "de-DE" ? "Abgeschlossen" : "Completed",
          undefined,
          undefined,
          undefined,
          true,
          false
        )}
    </Stack>
  );
}
