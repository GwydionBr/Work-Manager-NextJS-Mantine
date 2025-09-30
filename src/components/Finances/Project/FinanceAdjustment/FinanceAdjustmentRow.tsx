"use client";

import { useHover } from "@mantine/hooks";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Group, Text, ThemeIcon, Card, Transition } from "@mantine/core";
import {
  IconArrowRight,
  IconMinus,
  IconPlus,
  IconArrowLeft,
} from "@tabler/icons-react";

import { formatMoney, formatDate } from "@/utils/formatFunctions";

import { Currency } from "@/types/settings.types";
import { Tables } from "@/types/db.types";
import PayoutActionIcon from "@/components/UI/ActionIcons/PayoutActionIcon";
import FinanceClientBadge from "../../FinanceClient/FinanceClientBadge";
import { FinanceProject } from "@/types/finance.types";

interface FinanceAdjustmentRowProps {
  adultClientId: string | null;
  financeProject?: FinanceProject;
  adjustment?: Tables<"finance_project_adjustment">;
  currency: Currency;
  handlePayout: (id?: string) => void;
}

export default function FinanceAdjustmentRow({
  adultClientId,
  financeProject,
  adjustment,
  currency,
  handlePayout,
}: FinanceAdjustmentRowProps) {
  const { locale, getLocalizedText } = useSettingsStore();
  const { financeClients } = useFinanceStore();

  const { hovered, ref } = useHover();

  if (!adjustment && !financeProject) return null;

  let isIncome = false;
  let client = null;
  let amount = 0;
  let description = null;
  let createdAt = new Date();
  let isAdjustment = false;
  let id = undefined;

  if (adjustment) {
    isIncome = adjustment.amount > 0;
    amount = adjustment.amount;
    client = financeClients.find(
      (client) =>
        client.id === adjustment.finance_client_id ||
        client.id === adultClientId
    );
    description = adjustment.description;
    createdAt = new Date(adjustment.created_at);
    isAdjustment = true;
    id = adjustment.id;
  } else if (financeProject) {
    amount = financeProject.start_amount;
    isIncome = financeProject.start_amount > 0;
    client = financeClients.find(
      (client) => client.id === financeProject.finance_client_id
    );
    description = getLocalizedText("Startbetrag", "Start amount");
    createdAt = new Date(financeProject.created_at);
  }

  return (
    <Card
      p="sm"
      withBorder
      shadow="sm"
      radius="md"
      ref={ref}
      style={{
        border: hovered
          ? "1px solid light-dark(var(--mantine-color-gray-6), var(--mantine-color-dark-2))"
          : financeProject
            ? "1px solid light-dark(var(--mantine-color-gray-5), var(--mantine-color-dark-3))"
            : "",
      }}
    >
      <Group justify="space-between" align="flex-start">
        <Group gap="xs" align="center">
          <ThemeIcon
            size="sm"
            color={isIncome ? "green" : "red"}
            variant="transparent"
          >
            {isIncome ? (
              <IconArrowRight size={14} />
            ) : (
              <IconArrowLeft size={14} />
            )}
          </ThemeIcon>
          <ThemeIcon
            size="sm"
            color={isIncome ? "green" : "red"}
            variant="light"
          >
            {isIncome ? <IconPlus size={14} /> : <IconMinus size={14} />}
          </ThemeIcon>
          <Group gap="xs">
            <Text size="sm" fw={500} c={isIncome ? "green" : "red"}>
              {formatMoney(Math.abs(amount), currency, locale)}
            </Text>

            {description && (
              <Text size="sm" c="dimmed">
                {description}
              </Text>
            )}
          </Group>
          <Transition mounted={hovered} transition="fade-left" duration={200}>
            {(styles) => (
              <PayoutActionIcon
                ml={10}
                size="sm"
                onClick={() => handlePayout(id)}
                tooltipLabel={locale === "de-DE" ? "Auszahlung" : "Payout"}
                style={styles}
              />
            )}
          </Transition>
        </Group>

        <Group gap="xs" align="center">
          {client && <FinanceClientBadge client={client} />}

          <Text size="xs" c="dimmed">
            {formatDate(createdAt, locale)}
          </Text>
        </Group>
      </Group>
    </Card>
  );
}
