"use client";

import { useState, useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  Table,
  Stack,
  Group,
  Text,
  Divider,
  ActionIcon,
  Badge,
} from "@mantine/core";

import EditCashFlowButton from "@/components/Finances/CashFlow/EditCashFlowDrawer";
import CashFlowModal from "@/components/Finances/CashFlow/CashFlowModal";
import { formatDate, formatMoney } from "@/utils/formatFunctions";
import { FinanceInterval } from "@/types/settings.types";
import EditActionIcon from "@/components/UI/ActionIcons/EditActionIcon";
import { Tables } from "@/types/db.types";
import DelayedTooltip from "@/components/UI/DelayedTooltip";
import { IconCashPlus } from "@tabler/icons-react";
import FinancesNavbar from "../../FinancesNavbar";
import RecurringCashFlowRow from "./RecurringCashFlowRow";
import {
  showActionErrorNotification,
  showActionSuccessNotification,
  showDeleteConfirmationModal,
} from "@/utils/notificationFunctions";

export default function FinanceRecurringTab() {
  const { recurringCashFlows, deleteRecurringCashFlow } = useFinanceStore();
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

  const handleDelete = (id: string) => {
    showDeleteConfirmationModal(
      locale === "de-DE" ? "Cashflow löschen" : "Delete Cash Flow",
      locale === "de-DE"
        ? "Sind Sie sicher, dass Sie diesen Cashflow löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
        : "Are you sure you want to delete this cash flow? This action cannot be undone.",
      async () => {
        const deleted = await deleteRecurringCashFlow(id);
        if (deleted) {
          showActionSuccessNotification(
            locale === "de-DE"
              ? "Cashflow erfolgreich gelöscht"
              : "Cash flow deleted successfully",
            locale
          );
        } else {
          showActionErrorNotification(
            locale === "de-DE"
              ? "Cashflow konnte nicht gelöscht werden"
              : "Cash flow could not be deleted",
            locale
          );
        }
      },
      locale
    );
  };

  return (
    <Group w="100%">
      {/* Navbar */}
      <FinancesNavbar
        top={
          <Group justify="center">
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
          </Group>
        }
        navbar={<Text ta="center">Filter</Text>}
        bottom={
          <Stack align="flex-start">
            <Group justify="space-between">
              <Group gap="xs">
                <Text>{locale === "de-DE" ? "Ausgaben" : "Expense"}:</Text>
                <Text c="red" fw={700}>
                  {activeExpenseSum
                    ? activeExpenseSum.toLocaleString(locale, {
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
                  {activeIncomeSum
                    ? activeIncomeSum.toLocaleString(locale, {
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
              <Text
                c={activeTotalSum && activeTotalSum > 0 ? "green" : "red"}
                fw={700}
              >
                {activeTotalSum ? activeTotalSum : 0}
              </Text>
            </Group>
          </Stack>
        }
      />
      {/* Tables */}
      <Stack gap="xl" mb="xl" ml={230} w="100%">
        {activeCashFlows.length > 0 && (
          <Stack w="100%">
            <Divider
              w="100%"
              label={
                <Badge color="blue" variant="outline">
                  {locale === "de-DE" ? "Aktiv" : "Active"}
                </Badge>
              }
              labelPosition="left"
              size="sm"
              mb="md"
            />
            <Stack gap={0} ml="xl">
              {activeCashFlows.map((cashFlow) => (
                <RecurringCashFlowRow
                  key={cashFlow.id}
                  cashflow={cashFlow}
                  showNextDate
                  getIntervalLabel={getIntervalLabel}
                  onEdit={() => {
                    setSelectedCashFlow(cashFlow);
                    openEditCashFlow();
                  }}
                />
              ))}
            </Stack>
          </Stack>
        )}
        {futureCashFlows.length > 0 && (
          <Stack w="100%">
            <Divider
              w="100%"
              label={
                <Badge color="blue" variant="outline">
                  {locale === "de-DE" ? "Zukünftig" : "Future"}
                </Badge>
              }
              labelPosition="left"
            />
            <Stack gap={0} ml="xl">
              {futureCashFlows.map((cashFlow) => (
                <RecurringCashFlowRow
                  key={cashFlow.id}
                  cashflow={cashFlow}
                  showStartDate
                  getIntervalLabel={getIntervalLabel}
                  onEdit={() => {
                    setSelectedCashFlow(cashFlow);
                    openEditCashFlow();
                  }}
                />
              ))}
            </Stack>
          </Stack>
        )}
        {completedCashFlows.length > 0 && (
          <Stack w="100%">
            <Divider
              w="100%"
              labelPosition="left"
              label={
                <Badge color="blue" variant="outline">
                  {locale === "de-DE" ? "Abgeschlossen" : "Completed"}
                </Badge>
              }
            />
            <Stack gap={0} ml="xl">
              {completedCashFlows.map((cashFlow) => (
                <RecurringCashFlowRow
                  getIntervalLabel={getIntervalLabel}
                  key={cashFlow.id}
                  cashflow={cashFlow}
                  showEndDate
                  onEdit={() => {
                    setSelectedCashFlow(cashFlow);
                    openEditCashFlow();
                  }}
                />
              ))}
            </Stack>
          </Stack>
        )}
      </Stack>
      <CashFlowModal
        opened={cashFlowModalOpened}
        onClose={closeCashFlowModal}
        isSingle={false}
      />
      {selectedCashFlow && (
        <EditCashFlowButton
          cashFlow={selectedCashFlow}
          opened={editCashFlowOpened}
          onClose={closeEditCashFlow}
        />
      )}
    </Group>
  );
}
