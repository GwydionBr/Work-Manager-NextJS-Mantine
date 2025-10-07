"use client";

import { useState, useEffect, useMemo } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  Stack,
  Group,
  Text,
  Divider,
  ActionIcon,
  Badge,
  ThemeIcon,
  Collapse,
  Skeleton,
} from "@mantine/core";

import EditCashFlowButton from "@/components/Finances/CashFlow/EditCashFlowDrawer";
import CashFlowModal from "@/components/Finances/CashFlow/AddCashFlowModal";
import { FinanceInterval } from "@/types/settings.types";
import DelayedTooltip from "@/components/UI/DelayedTooltip";
import {
  IconCalendarEvent,
  IconCashMove,
  IconCashMoveBack,
  IconCashPlus,
  IconCheck,
  IconList,
} from "@tabler/icons-react";
import FinancesNavbar from "../../FinancesNavbar";
import RecurringCashFlowRow from "./RecurringCashFlowRow";
import AdjustmentActionIcon from "@/components/UI/ActionIcons/AdjustmentActionIcon";
import { SettingsTab } from "@/components/Settings/SettingsModal";
import { RecurringCashFlow } from "@/types/finance.types";
import { formatMoney } from "@/utils/formatFunctions";
import useRecurringCashflowQuery from "@/utils/queries/finances/use_recurring-cashflow-query";

export default function FinanceRecurringTab() {
  const { data: recurringCashFlows = [], isPending } = useRecurringCashflowQuery();
  const { locale, defaultFinanceCurrency, setIsModalOpen, setSelectedTab } =
    useSettingsStore();

  const [filter, setFilter] = useState<
    "all" | "active" | "completed" | "future"
  >("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "expense" | "income">(
    "all"
  );

  // Single Edit
  const [
    editCashFlowOpened,
    { open: openEditCashFlow, close: closeEditCashFlow },
  ] = useDisclosure(false);
  const [selectedCashFlow, setSelectedCashFlow] =
    useState<RecurringCashFlow | null>(null);

  // Single Add
  const [
    cashFlowModalOpened,
    { open: openCashFlowModal, close: closeCashFlowModal },
  ] = useDisclosure(false);

  useEffect(() => {
    if (recurringCashFlows?.length === 0) {
      setFilter("all");
      setSelectedCashFlow(null);
    } else if (recurringCashFlows.length > 0 && selectedCashFlow === null) {
      setSelectedCashFlow(recurringCashFlows[0]);
    }
  }, [recurringCashFlows]);

  // Filter active and completed recurring cash flows
  const today = new Date();
  const activeCashFlows = useMemo(
    () =>
      recurringCashFlows.filter((cashFlow) => {
        // Base active condition: started and (no end date or ends in the future)
        const hasStarted = new Date(cashFlow.start_date) <= today;
        const endsInFuture =
          !cashFlow.end_date || new Date(cashFlow.end_date) > today;
        return hasStarted && endsInFuture;
      }),
    [recurringCashFlows]
  );

  const filteredActiveCashFlows = useMemo(
    () =>
      activeCashFlows.filter((cashFlow) => {
        if (typeFilter === "all") return true;
        if (typeFilter === "income") return cashFlow.type === "income";
        if (typeFilter === "expense") return cashFlow.type === "expense";
        return false;
      }),
    [activeCashFlows, typeFilter]
  );

  const activeExpenseSum = useMemo(
    () =>
      activeCashFlows
        .filter((cashFlow) => cashFlow.type === "expense")
        .reduce((sum, cashFlow) => {
          return sum + cashFlow.amount;
        }, 0),
    [activeCashFlows]
  );

  const activeIncomeSum = useMemo(
    () =>
      activeCashFlows
        .filter((cashFlow) => cashFlow.type === "income")
        .reduce((sum, cashFlow) => {
          return sum + cashFlow.amount;
        }, 0),
    [activeCashFlows]
  );

  const activeTotalSum = activeIncomeSum + activeExpenseSum;

  const completedCashFlows = useMemo(
    () =>
      recurringCashFlows.filter((cashFlow) => {
        if (!cashFlow.end_date) return false; // No end date = not completed
        const endDate = new Date(cashFlow.end_date);
        let isCompleted = endDate <= today;
        if (typeFilter === "income")
          isCompleted = isCompleted && cashFlow.type === "income";
        if (typeFilter === "expense")
          isCompleted = isCompleted && cashFlow.type === "expense";
        return isCompleted;
      }),
    [recurringCashFlows, typeFilter]
  );

  const filteredCompletedCashFlows = useMemo(
    () =>
      completedCashFlows.filter((cashFlow) => {
        if (typeFilter === "all") return true;
        if (typeFilter === "income") return cashFlow.type === "income";
        if (typeFilter === "expense") return cashFlow.type === "expense";
        return false;
      }),
    [completedCashFlows, typeFilter]
  );

  const futureCashFlows = useMemo(
    () =>
      recurringCashFlows.filter((cashFlow) => {
        const startDate = new Date(cashFlow.start_date);
        let isFuture = startDate > today;
        if (typeFilter === "income")
          isFuture = isFuture && cashFlow.type === "income";
        if (typeFilter === "expense")
          isFuture = isFuture && cashFlow.type === "expense";
        return isFuture;
      }),
    [recurringCashFlows, typeFilter]
  );

  const filteredFutureCashFlows = useMemo(
    () =>
      futureCashFlows.filter((cashFlow) => {
        if (typeFilter === "all") return true;
        if (typeFilter === "income") return cashFlow.type === "income";
        if (typeFilter === "expense") return cashFlow.type === "expense";
        return false;
      }),
    [futureCashFlows, typeFilter]
  );

  const navbarItems = useMemo(() => {
    return [
      [
        {
          label: locale === "de-DE" ? "Alle" : "All",
          leftSection: (
            <ThemeIcon variant="transparent" color="gray">
              <IconList />
            </ThemeIcon>
          ),
          active: filter === "all",
          onClick: () => setFilter("all"),
          disabled: recurringCashFlows.length === 0,
        },
        {
          label: locale === "de-DE" ? "Aktiv" : "Active",
          leftSection: (
            <ThemeIcon variant="transparent" color="grape">
              <IconList />
            </ThemeIcon>
          ),
          active: filter === "active",
          onClick: () => setFilter("active"),
          disabled: activeCashFlows.length === 0,
        },
        {
          label: locale === "de-DE" ? "Abgeschlossen" : "Completed",
          leftSection: (
            <ThemeIcon variant="transparent" color="green">
              <IconCheck />
            </ThemeIcon>
          ),
          active: filter === "completed",
          onClick: () => setFilter("completed"),
          disabled: completedCashFlows.length === 0,
        },
        {
          label: locale === "de-DE" ? "Zukünftig" : "Future",
          leftSection: (
            <ThemeIcon variant="transparent" color="blue">
              <IconCalendarEvent />
            </ThemeIcon>
          ),
          active: filter === "future",
          onClick: () => setFilter("future"),
          disabled: futureCashFlows.length === 0,
        },
      ],
      [
        {
          label: locale === "de-DE" ? "Ausgaben" : "Expense",
          leftSection: (
            <ThemeIcon variant="transparent" color="red">
              <IconCashMoveBack />
            </ThemeIcon>
          ),
          active: typeFilter === "expense",
          onClick: () =>
            setTypeFilter((prev) => (prev === "expense" ? "all" : "expense")),
          disabled:
            recurringCashFlows.filter((cashFlow) => cashFlow.type === "expense")
              .length === 0,
        },
        {
          label: locale === "de-DE" ? "Einnahmen" : "Income",
          leftSection: (
            <ThemeIcon variant="transparent" color="green">
              <IconCashMove />
            </ThemeIcon>
          ),
          active: typeFilter === "income",
          onClick: () =>
            setTypeFilter((prev) => (prev === "income" ? "all" : "income")),
          disabled:
            recurringCashFlows.filter((cashFlow) => cashFlow.type === "income")
              .length === 0,
        },
      ],
    ];
  }, [filter, locale, recurringCashFlows, typeFilter]);

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

  return (
    <Group w="100%">
      {/* Navbar */}
      <FinancesNavbar
        top={
          <Group justify="space-between">
            <AdjustmentActionIcon
              size="lg"
              variant="transparent"
              tooltipLabel={
                locale === "de-DE"
                  ? "Finanzeinstellungen anpassen"
                  : "Adjust finance settings"
              }
              iconSize={20}
              onClick={() => {
                setIsModalOpen(true);
                setSelectedTab(SettingsTab.FINANCE);
              }}
            />
            <DelayedTooltip
              label={
                locale === "de-DE"
                  ? "Wiederkehrenden Cashflow hinzufügen"
                  : "Add Recurring Cash Flow"
              }
            >
              <ActionIcon
                onClick={openCashFlowModal}
                variant="transparent"
                size="lg"
              >
                <IconCashPlus size={22} />
              </ActionIcon>
            </DelayedTooltip>
            {/* <SelectActionIcon
              iconSize={20}   
              onClick={toggleBulkSelection}
              selected={bulkSelectionActive}
              partiallySelected={
                selectedCashFlows.length > 0 &&
                selectedCashFlows.length < filteredActiveCashFlows.length
              }
              disabled={filteredActiveCashFlows.length === 0}
              tooltipLabel={
                bulkSelectionActive
                  ? locale === "de-DE"
                    ? "Deaktiviere Mehrfachauswahl"
                    : "Deactivate bulk select"
                  : locale === "de-DE"
                    ? "Aktiviere Mehrfachauswahl"
                    : "Activate bulk select"
              }
              mainControl
            /> */}
          </Group>
        }
        isNavbar
        navbarItems={navbarItems}
        bottom={
          <Stack align="flex-start">
            <Group justify="space-between">
              <Group gap="xs">
                <Text>{locale === "de-DE" ? "Ausgaben" : "Expense"}:</Text>
                <Text c="red" fw={700}>
                  {activeExpenseSum
                    ? formatMoney(
                        activeExpenseSum,
                        defaultFinanceCurrency,
                        locale
                      )
                    : 0}
                </Text>
              </Group>
              <Group gap="xs">
                <Text>{locale === "de-DE" ? "Einnahmen" : "Income"}:</Text>
                <Text c="green" fw={700}>
                  {activeIncomeSum
                    ? formatMoney(
                        activeIncomeSum,
                        defaultFinanceCurrency,
                        locale
                      )
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
                {activeTotalSum
                  ? formatMoney(activeTotalSum, defaultFinanceCurrency, locale)
                  : 0}
              </Text>
            </Group>
          </Stack>
        }
      />
      {/* Tables */}
      <Stack gap="sm" mb="xl" ml={230} w="100%">
        {isPending ? (
          Array.from({ length: 5 }, (_, i) => (
            <Skeleton height={45} w="100%" key={i} />
          ))
        ) : (
          <Stack gap="xl">
            <Collapse in={filter !== "future" && filter !== "completed"}>
              {filteredActiveCashFlows.length > 0 && (
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
                    {filteredActiveCashFlows.map((cashFlow) => (
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
            </Collapse>
            <Collapse in={filter !== "active" && filter !== "completed"}>
              {filteredFutureCashFlows.length > 0 && (
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
                    {filteredFutureCashFlows.map((cashFlow) => (
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
            </Collapse>
            <Collapse in={filter !== "active" && filter !== "future"}>
              {filteredCompletedCashFlows.length > 0 && (
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
                    {filteredCompletedCashFlows.map((cashFlow) => (
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
            </Collapse>
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
