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
  Badge,
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
  IconTag,
} from "@tabler/icons-react";
import DelayedTooltip from "@/components/UI/DelayedTooltip";
import SingleCashflowRow from "./SingleCashflowRow";

export default function FinanceSingleTab() {
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
        <Stack gap={0}>
          {sortedSingleCashFlows.map((cashFlow) => {
            return <SingleCashflowRow key={cashFlow.id} cashflow={cashFlow} />;
          })}
        </Stack>
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
