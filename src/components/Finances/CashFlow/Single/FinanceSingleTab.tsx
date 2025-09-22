"use client";

import { useEffect, useMemo, useState } from "react";
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

export default function FinanceSingleTab() {
  const { singleCashFlows } = useFinanceStore();
  const { locale } = useSettingsStore();
  const [typeFilter, setTypeFilter] = useState<"all" | "expense" | "income">(
    "all"
  );
  const [
    editCashFlowOpened,
    { open: openEditCashFlow, close: closeEditCashFlow },
  ] = useDisclosure(false);
  const [
    cashFlowModalOpened,
    { open: openCashFlowModal, close: closeCashFlowModal },
  ] = useDisclosure(false);
  const [selectedCashFlow, setSelectedCashFlow] =
    useState<Tables<"single_cash_flow"> | null>(null);

  const sortedSingleCashFlows = useMemo(
    () =>
      singleCashFlows.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [singleCashFlows]
  );

  const statistics = useMemo(() => {
    return {
      expenses: [
        sortedSingleCashFlows
          .filter((cashFlow) => {
            const date = new Date(cashFlow.date);
            if (cashFlow.type === "income") return false;
            return date.getMonth() === new Date().getMonth();
          })
          .reduce((acc, cashFlow) => acc + cashFlow.amount, 0),
        sortedSingleCashFlows
          .filter((cashFlow) => {
            const date = new Date(cashFlow.date);
            if (cashFlow.type === "income") return false;
            return date.getMonth() === new Date().getMonth() - 1;
          })
          .reduce((acc, cashFlow) => acc + cashFlow.amount, 0),
      ],
      income: [
        sortedSingleCashFlows
          .filter((cashFlow) => {
            const date = new Date(cashFlow.date);
            if (cashFlow.type === "expense") return false;
            return date.getMonth() === new Date().getMonth();
          })
          .reduce((acc, cashFlow) => acc + cashFlow.amount, 0),
        sortedSingleCashFlows
          .filter((cashFlow) => {
            const date = new Date(cashFlow.date);
            if (cashFlow.type === "expense") return false;
            return date.getMonth() === new Date().getMonth() - 1;
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

  useEffect(() => {
    if (selectedCashFlow === null && sortedSingleCashFlows.length > 0) {
      setSelectedCashFlow(sortedSingleCashFlows[0]);
    }
  }, []);

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
          active: typeFilter === "all",
          onClick: () => setTypeFilter("all"),
          disabled: singleCashFlows.length === 0,
        },
        {
          label: locale === "de-DE" ? "Ausgaben" : "Expenses",
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
          label: locale === "de-DE" ? "Einnahmen" : "Income",
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
          <Group justify="center">
            <DelayedTooltip
              label={
                locale === "de-DE"
                  ? "Einmalzahlung hinzufügen"
                  : "Add Single Cash Flow"
              }
            >
              <ActionIcon
                onClick={openCashFlowModal}
                variant="subtle"
                size="lg"
              >
                <IconCashPlus />
              </ActionIcon>
            </DelayedTooltip>
          </Group>
        }
        isNavbar
        navbarItems={navbarItems}
        bottom={
          <Stack>
            <Text>{locale === "de-DE" ? "Dieser Monat" : "This Month"}: </Text>
            <Group justify="space-between">
              <Text c="red">
                {formatMoney(statistics.expenses[0], "EUR", locale)}
              </Text>
              <Text c="green">
                {formatMoney(statistics.income[0], "EUR", locale)}
              </Text>
            </Group>
            <Text>{locale === "de-DE" ? "Letzter Monat" : "Last Month"}: </Text>
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
