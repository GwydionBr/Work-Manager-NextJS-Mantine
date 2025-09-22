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
  Divider,
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
  IconList,
  IconTag,
} from "@tabler/icons-react";
import DelayedTooltip from "@/components/UI/DelayedTooltip";
import SingleCashflowRow from "./SingleCashflowRow";
import FinancesNavbar from "../../FinancesNavbar";

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
                <SingleCashflowRow cashflow={cashFlow} ml="xl" />
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
