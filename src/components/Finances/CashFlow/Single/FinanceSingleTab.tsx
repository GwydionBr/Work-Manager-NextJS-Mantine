"use client";

import { useEffect, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  Group,
  Text,
  ScrollArea,
  Stack,
  ActionIcon,
  Badge,
  Divider,
} from "@mantine/core";
import EditCashFlowDrawer from "@/components/Finances/CashFlow/EditCashFlowDrawer";
import CashFlowModal from "@/components/Finances/CashFlow/CashFlowModal";

import { formatDate } from "@/utils/formatFunctions";
import { Tables } from "@/types/db.types";
import { IconCashPlus } from "@tabler/icons-react";
import DelayedTooltip from "@/components/UI/DelayedTooltip";
import SingleCashflowRow from "./SingleCashflowRow";
import FinancesNavbar from "../../FinancesNavbar";
import { modals } from "@mantine/modals";
import {
  showActionErrorNotification,
  showActionSuccessNotification,
  showDeleteConfirmationModal,
} from "@/utils/notificationFunctions";

export default function FinanceSingleTab() {
  const { singleCashFlows, deleteSingleCashFlow } = useFinanceStore();
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
    useState<Tables<"single_cash_flow"> | null>(null);
  const sortedSingleCashFlows = singleCashFlows.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  useEffect(() => {
    if (sortedSingleCashFlows.length > 0) {
      setSelectedCashFlow(sortedSingleCashFlows[0]);
    }
  }, [sortedSingleCashFlows]);

  const handleDelete = (id: string) => {
    showDeleteConfirmationModal(
      locale === "de-DE" ? "Einmalzahlung löschen" : "Delete Single Cash Flow",
      locale === "de-DE"
        ? "Sind Sie sicher, dass Sie diese Einmalzahlung löschen möchten?"
        : "Are you sure you want to delete this single cash flow?",
      async () => {
        const deleted = await deleteSingleCashFlow(id);
        if (deleted) {
          showActionSuccessNotification(
            locale === "de-DE"
              ? "Einmalzahlung erfolgreich gelöscht"
              : "Single cash flow deleted successfully",
            locale
          );
        } else {
          showActionErrorNotification(
            locale === "de-DE"
              ? "Einmalzahlung konnte nicht gelöscht werden"
              : "Single cash flow could not be deleted",
            locale
          );
        }
      },
      locale
    );
  };

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
        }
        navbar={<Text ta="center">Filter</Text>}
        bottom={<Text ta="center">Statistiken</Text>}
      />
      <ScrollArea mb="md" ml={230} w="100%">
        <Stack gap={0}>
          {sortedSingleCashFlows.map((cashFlow, index) => {
            const isNewDate =
              index === 0 ||
              sortedSingleCashFlows[index - 1].date.split("T")[0] !==
                cashFlow.date.split("T")[0];
            return (
              <Stack key={cashFlow.id} gap={5}>
                {isNewDate && (
                  <Divider
                    mt={5}
                    label={
                      <Badge variant="light" color="gray">
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
                  onDelete={() => handleDelete(cashFlow.id)}
                />
              </Stack>
            );
          })}
        </Stack>

        {selectedCashFlow && (
          <EditCashFlowDrawer
            cashFlow={selectedCashFlow}
            opened={editCashFlowOpened}
            onClose={closeEditCashFlow}
          />
        )}
      </ScrollArea>
    </Group>
  );
}
