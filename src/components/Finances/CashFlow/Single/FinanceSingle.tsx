"use client";

import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  Table,
  Group,
  Text,
  ScrollArea,
  Stack,
  ActionIcon,
} from "@mantine/core";
import EditCashFlowDrawer from "@/components/Finances/CashFlow/EditCashFlowDrawer";
import CashFlowModal from "@/components/Finances/CashFlow/CashFlowModal";
import EditActionIcon from "@/components/UI/ActionIcons/EditActionIcon";

import { formatDate, formatMoney } from "@/utils/formatFunctions";
import { Tables } from "@/types/db.types";
import {
  IconCashMove,
  IconCashMoveBack,
  IconCashPlus,
} from "@tabler/icons-react";
import DelayedTooltip from "@/components/UI/DelayedTooltip";

export default function FinanceSingle() {
  const { singleCashFlows, financeCategories } = useFinanceStore();
  const { locale } = useSettingsStore();
  const [
    editCashFlowOpened,
    { open: openEditCashFlow, close: closeEditCashFlow },
  ] = useDisclosure(false);
  const [
    cashFlowModalOpened,
    { open: openCashFlowModal, close: closeCashFlowModal },
  ] = useDisclosure(false);
  const [selectedCashFlow, setSelectedCashFlow] =
    useState<Tables<"single_cash_flow"> | null>(singleCashFlows[0] ?? null);
  const sortedSingleCashFlows = singleCashFlows.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <ScrollArea mb="md">
      <Stack>
        <Group justify="center">
          <DelayedTooltip
            label={
              locale === "de-DE"
                ? "Einmalzahlung hinzufügen"
                : "Add Single Cash Flow"
            }
          >
            <ActionIcon onClick={openCashFlowModal} variant="subtle">
              <IconCashPlus />
            </ActionIcon>
          </DelayedTooltip>
          <CashFlowModal
            opened={cashFlowModalOpened}
            onClose={closeCashFlowModal}
            isSingle={true}
          />
        </Group>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{locale === "de-DE" ? "Datum" : "Date"}</Table.Th>
              <Table.Th>{locale === "de-DE" ? "Betrag" : "Amount"}</Table.Th>
              <Table.Th>{locale === "de-DE" ? "Name" : "Name"}</Table.Th>
              <Table.Th>
                {locale === "de-DE" ? "Kategorie" : "Category"}
              </Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {sortedSingleCashFlows.map((cashFlow) => {
              return (
                <Table.Tr key={cashFlow.id}>
                  <Table.Td>
                    <Group>
                      {cashFlow.type === "expense" ? (
                        <IconCashMoveBack color="red" />
                      ) : (
                        <IconCashMove color="green" />
                      )}
                      {formatDate(new Date(cashFlow.date), locale)}
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text
                      size="sm"
                      fw={600}
                      c={cashFlow.type === "expense" ? "red" : "green"}
                    >
                      {formatMoney(cashFlow.amount, cashFlow.currency, locale)}
                    </Text>
                  </Table.Td>
                  <Table.Td>{cashFlow.title}</Table.Td>
                  <Table.Td>
                    {
                      financeCategories.find(
                        (category) => category.id === cashFlow.category_id
                      )?.title
                    }
                  </Table.Td>
                  <Table.Td>
                    <EditActionIcon
                      onClick={() => {
                        setSelectedCashFlow(cashFlow);
                        openEditCashFlow();
                      }}
                    />
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Stack>

      {selectedCashFlow && (
        <EditCashFlowDrawer
          cashFlow={selectedCashFlow}
          opened={editCashFlowOpened}
          onClose={closeEditCashFlow}
        />
      )}
    </ScrollArea>
  );
}
