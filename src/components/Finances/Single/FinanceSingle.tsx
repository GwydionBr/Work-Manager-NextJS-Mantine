"use client";

import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Box, Table, alpha } from "@mantine/core";
import EditCashFlowDrawer from "../EditCashFlowDrawer";
import NewCashFlowButton from "../NewCashFlowButton";
import EditActionIcon from "@/components/UI/ActionIcons/EditActionIcon";

import classes from "./FinanceSingle.module.css";
import { formatDate, formatMoney } from "@/utils/formatFunctions";
import { Tables } from "@/types/db.types";

export default function FinanceSingle() {
  const { singleCashFlows, financeCategories } = useFinanceStore();
  const { locale } = useSettingsStore();
  const [
    editCashFlowOpened,
    { open: openEditCashFlow, close: closeEditCashFlow },
  ] = useDisclosure(false);
  const [selectedCashFlow, setSelectedCashFlow] =
    useState<Tables<"single_cash_flow"> | null>(singleCashFlows[0] ?? null);
  const sortedSingleCashFlows = singleCashFlows.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Box className={classes.financeSingleContainer} mb="md">
      <NewCashFlowButton
        isSingle={true}
        tooltipLabel={
          locale === "de-DE"
            ? "Einmalzahlung hinzufügen"
            : "Add Single Cash Flow"
        }
      />
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{locale === "de-DE" ? "Datum" : "Date"}</Table.Th>
            <Table.Th>{locale === "de-DE" ? "Name" : "Name"}</Table.Th>
            <Table.Th>{locale === "de-DE" ? "Betrag" : "Amount"}</Table.Th>
            <Table.Th>{locale === "de-DE" ? "Kategorie" : "Category"}</Table.Th>
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
      {selectedCashFlow && (
        <EditCashFlowDrawer
          cashFlow={selectedCashFlow}
          opened={editCashFlowOpened}
          onClose={closeEditCashFlow}
        />
      )}
    </Box>
  );
}
