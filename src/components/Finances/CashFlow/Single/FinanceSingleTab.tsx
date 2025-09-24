"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  Group,
  ScrollArea,
  Stack,
  ActionIcon,
  Badge,
  Divider,
  ThemeIcon,
  Text,
  Collapse,
  Card,
} from "@mantine/core";
import EditCashFlowDrawer from "@/components/Finances/CashFlow/EditCashFlowDrawer";
import CashFlowModal from "@/components/Finances/CashFlow/CashFlowModal";

import { formatDate, formatMoney } from "@/utils/formatFunctions";
import { Tables } from "@/types/db.types";
import {
  IconCashMove,
  IconCashMoveBack,
  IconCashPlus,
  IconList,
} from "@tabler/icons-react";
import DelayedTooltip from "@/components/UI/DelayedTooltip";
import SingleCashflowRow from "./SingleCashflowRow";
import FinancesNavbar from "../../FinancesNavbar";
import AdjustmentActionIcon from "@/components/UI/ActionIcons/AdjustmentActionIcon";
import { SettingsTab } from "@/components/Settings/SettingsModal";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";
import DeleteActionIcon from "@/components/UI/ActionIcons/DeleteActionIcon";

export default function FinanceSingleTab() {
  const { singleCashFlows } = useFinanceStore();
  const { locale, setIsModalOpen, setSelectedTab, getLocalizedText } =
    useSettingsStore();
  const [typeFilter, setTypeFilter] = useState<"all" | "expense" | "income">(
    "all"
  );

  // Single Add
  const [
    cashFlowModalOpened,
    { open: openCashFlowModal, close: closeCashFlowModal },
  ] = useDisclosure(false);

  // Bulk selection
  const [
    bulkSelectionActive,
    { toggle: toggleBulkSelection, close: closeBulkSelection },
  ] = useDisclosure(false);
  const [selectedCashFlows, setSelectedCashFlows] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null
  );

  // Single Edit
  const [selectedCashFlow, setSelectedCashFlow] =
    useState<Tables<"single_cash_flow"> | null>(null);
  const [
    editCashFlowOpened,
    { open: openEditCashFlow, close: closeEditCashFlow },
  ] = useDisclosure(false);

  const sortedSingleCashFlows = useMemo(
    () =>
      singleCashFlows.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [singleCashFlows]
  );

  useEffect(() => {
    if (sortedSingleCashFlows.length === 0) {
      setTypeFilter("all");
      closeBulkSelection();
      setSelectedCashFlows([]);
      setSelectedCashFlow(null);
    } else if (selectedCashFlow === null) {
      setSelectedCashFlow(sortedSingleCashFlows[0]);
    }
  }, [sortedSingleCashFlows]);

  const handleToggleBulkSelection = () => {
    toggleBulkSelection();
    setSelectedCashFlows([]);
    setLastSelectedIndex(null);
  };

  const statistics = useMemo(() => {
    return {
      expenses: [
        sortedSingleCashFlows
          .filter((cashFlow) => {
            const date = new Date(cashFlow.date);
            if (cashFlow.type === "income") return false;
            return (
              date.getMonth() === new Date().getMonth() &&
              date.getFullYear() === new Date().getFullYear()
            );
          })
          .reduce((acc, cashFlow) => acc + cashFlow.amount, 0),
        sortedSingleCashFlows
          .filter((cashFlow) => {
            const date = new Date(cashFlow.date);
            if (cashFlow.type === "income") return false;
            return (
              date.getMonth() === new Date().getMonth() - 1 &&
              date.getFullYear() === new Date().getFullYear()
            );
          })
          .reduce((acc, cashFlow) => acc + cashFlow.amount, 0),
      ],
      income: [
        sortedSingleCashFlows
          .filter((cashFlow) => {
            const date = new Date(cashFlow.date);
            if (cashFlow.type === "expense") return false;
            return (
              date.getMonth() === new Date().getMonth() &&
              date.getFullYear() === new Date().getFullYear()
            );
          })
          .reduce((acc, cashFlow) => acc + cashFlow.amount, 0),
        sortedSingleCashFlows
          .filter((cashFlow) => {
            const date = new Date(cashFlow.date);
            if (cashFlow.type === "expense") return false;
            return (
              date.getMonth() === new Date().getMonth() - 1 &&
              date.getFullYear() === new Date().getFullYear()
            );
          })
          .reduce((acc, cashFlow) => acc + cashFlow.amount, 0),
      ],
    };
  }, [sortedSingleCashFlows]);

  const filteredSingleCashFlows = useMemo(() => {
    return sortedSingleCashFlows.filter((cashFlow) => {
      if (typeFilter === "all") return true;
      if (typeFilter === "expense") return cashFlow.type === "expense";
      if (typeFilter === "income") return cashFlow.type === "income";
      return false;
    });
  }, [sortedSingleCashFlows, typeFilter]);

  const toggleAllCashFlows = useCallback(() => {
    if (selectedCashFlows.length > 0) {
      setSelectedCashFlows([]);
    } else {
      setSelectedCashFlows(filteredSingleCashFlows.map((c) => c.id));
    }
  }, [filteredSingleCashFlows, selectedCashFlows]);

  const navbarItems = useMemo(() => {
    return [
      [
        {
          label: getLocalizedText("Alle", "All"),
          leftSection: (
            <ThemeIcon variant="transparent" color="gray">
              <IconList />
            </ThemeIcon>
          ),
          active: typeFilter === "all",
          onClick: () => setTypeFilter("all"),
          disabled: singleCashFlows.length === 0,
        },
        {
          label: getLocalizedText("Ausgaben", "Expenses"),
          leftSection: (
            <ThemeIcon variant="transparent" color="red">
              <IconCashMoveBack />
            </ThemeIcon>
          ),
          active: typeFilter === "expense",
          onClick: () => setTypeFilter("expense"),
          disabled:
            singleCashFlows.filter((cashFlow) => cashFlow.type === "expense")
              .length === 0,
        },
        {
          label: getLocalizedText("Einnahmen", "Income"),
          leftSection: (
            <ThemeIcon variant="transparent" color="green">
              <IconCashMove />
            </ThemeIcon>
          ),
          active: typeFilter === "income",
          onClick: () => setTypeFilter("income"),
          disabled:
            singleCashFlows.filter((cashFlow) => cashFlow.type === "income")
              .length === 0,
        },
      ],
    ];
  }, [locale, singleCashFlows, typeFilter]);

  return (
    <Group>
      <FinancesNavbar
        top={
          <Group justify="space-between">
            <AdjustmentActionIcon
              size="lg"
              variant="transparent"
              tooltipLabel={getLocalizedText(
                "Finanzeinstellungen anpassen",
                "Adjust finance settings"
              )}
              iconSize={20}
              onClick={() => {
                setIsModalOpen(true);
                setSelectedTab(SettingsTab.FINANCE);
              }}
            />
            <DelayedTooltip
              label={getLocalizedText(
                "Einmalzahlung hinzufügen",
                "Add Single Cash Flow"
              )}
            >
              <ActionIcon
                onClick={openCashFlowModal}
                variant="transparent"
                size="lg"
              >
                <IconCashPlus size={22} />
              </ActionIcon>
            </DelayedTooltip>
            <SelectActionIcon
              iconSize={20}
              onClick={toggleBulkSelection}
              selected={bulkSelectionActive}
              partiallySelected={
                selectedCashFlows.length > 0 &&
                selectedCashFlows.length < filteredSingleCashFlows.length
              }
              disabled={filteredSingleCashFlows.length === 0}
              tooltipLabel={
                bulkSelectionActive
                  ? getLocalizedText(
                      "Deaktiviere Mehrfachauswahl",
                      "Deactivate bulk select"
                    )
                  : getLocalizedText(
                      "Aktiviere Mehrfachauswahl",
                      "Activate bulk select"
                    )
              }
              mainControl
            />
          </Group>
        }
        isNavbar
        navbarItems={navbarItems}
        bottom={
          <Stack>
            <Text>{getLocalizedText("Dieser Monat", "This Month")}: </Text>
            <Group justify="space-between">
              <Text c="red">
                {formatMoney(statistics.expenses[0], "EUR", locale)}
              </Text>
              <Text c="green">
                {formatMoney(statistics.income[0], "EUR", locale)}
              </Text>
            </Group>
            <Text>{getLocalizedText("Letzter Monat", "Last Month")}: </Text>
            <Group justify="space-between">
              <Text c="red">
                {formatMoney(statistics.expenses[1], "EUR", locale)}
              </Text>
              <Text c="green">
                {formatMoney(statistics.income[1], "EUR", locale)}
              </Text>
            </Group>
          </Stack>
        }
      />
      <ScrollArea mb="md" ml={230} w="100%">
        <Collapse
          in={bulkSelectionActive && filteredSingleCashFlows.length > 0}
          w="100%"
        >
          <Card
            p="md"
            mb="md"
            withBorder
            shadow="sm"
            radius="md"
            style={{
              borderColor:
                "light-dark(var(--mantine-color-blue-3), var(--mantine-color-blue-8))",
            }}
          >
            <Group justify="space-between" align="center">
              <Group onClick={toggleAllCashFlows} style={{ cursor: "pointer" }}>
                <SelectActionIcon
                  onClick={handleToggleBulkSelection}
                  selected={
                    selectedCashFlows.length === filteredSingleCashFlows.length
                  }
                  partiallySelected={
                    selectedCashFlows.length > 0 &&
                    selectedCashFlows.length < filteredSingleCashFlows.length
                  }
                />
                <Text fz="sm" c="dimmed">
                  {getLocalizedText("Alle auswählen", "Select All")}
                </Text>
              </Group>

              <Badge color="blue" variant="light">
                {selectedCashFlows.length}{" "}
                {getLocalizedText("ausgewählt", "selected")}
              </Badge>

              <Group gap="xs">
                <DeleteActionIcon
                  disabled={selectedCashFlows.length === 0}
                  onClick={() => console.log(selectedCashFlows)}
                />
              </Group>
            </Group>
          </Card>
        </Collapse>
        <Stack gap={0}>
          {filteredSingleCashFlows.map((cashFlow, index) => {
            const isNewDate =
              index === 0 ||
              new Date(filteredSingleCashFlows[index - 1].date).setHours(
                0,
                0,
                0,
                0
              ) !== new Date(cashFlow.date).setHours(0, 0, 0, 0);
            return (
              <Stack key={cashFlow.id} gap={5}>
                {isNewDate && (
                  <Divider
                    mt={5}
                    label={
                      <Badge variant="light">
                        {formatDate(new Date(cashFlow.date), locale)}
                      </Badge>
                    }
                    labelPosition="left"
                  />
                )}
                <SingleCashflowRow
                  cashflow={cashFlow}
                  ml="xl"
                  onEdit={() => {
                    setSelectedCashFlow(cashFlow);
                    openEditCashFlow();
                  }}
                />
              </Stack>
            );
          })}
        </Stack>
      </ScrollArea>
      {selectedCashFlow && (
        <EditCashFlowDrawer
          cashFlow={selectedCashFlow}
          opened={editCashFlowOpened}
          onClose={closeEditCashFlow}
        />
      )}
      <CashFlowModal
        opened={cashFlowModalOpened}
        onClose={closeCashFlowModal}
        isSingle={true}
      />
    </Group>
  );
}
