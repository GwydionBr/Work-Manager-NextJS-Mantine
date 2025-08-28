"use client";

import { useSettingsStore } from "@/stores/settingsStore";

import {
  Button,
  Text,
  Stack,
  Divider,
  Alert,
  NumberInput,
  Switch,
} from "@mantine/core";
import { IconBrandCashapp, IconAlertCircle } from "@tabler/icons-react";

import * as helper from "@/utils/formatFunctions";
import type { Tables } from "@/types/db.types";

interface ProjectPayoutMenuProps {
  project: Tables<"timer_project">;
  availablePayout: number;
  useCustomAmount: boolean;
  payoutAmount: number;
  closeMenu: () => void;
  openModal: () => void;
  setUseCustomAmount: (value: boolean) => void;
  setPayoutAmount: (value: number) => void;
}

export default function ProjectPayoutMenu({
  project,
  availablePayout,
  useCustomAmount,
  payoutAmount,
  closeMenu,
  openModal,
  setUseCustomAmount,
  setPayoutAmount,
}: ProjectPayoutMenuProps) {
  const { locale } = useSettingsStore();

  const handleProjectSalaryPayout = async () => {
    closeMenu();
    openModal();
  };
  return (
    <Stack p="md" gap="md">
      <Text size="sm" fw={500}>
        {locale === "de-DE"
          ? "Projektgehalt auszahlen"
          : "Project Salary Payout"}
      </Text>

      <Stack gap="xs">
        <Text size="sm" c="dimmed">
          {locale === "de-DE" ? "Gesamtgehalt" : "Total Salary"}:{" "}
          {helper.formatMoney(project.salary, project.currency, locale)}
        </Text>
        <Text size="sm" c="dimmed">
          {locale === "de-DE" ? "Bereits ausgezahlt" : "Already Paid"}:{" "}
          {helper.formatMoney(
            project.total_payout || 0,
            project.currency,
            locale
          )}
        </Text>
        <Text size="sm" fw={500} c="teal">
          {locale === "de-DE" ? "Verfügbar" : "Available"}:{" "}
          {helper.formatMoney(availablePayout, project.currency, locale)}
        </Text>
      </Stack>

      {availablePayout > 0 ? (
        <>
          <Divider />

          <Switch
            label={
              locale === "de-DE"
                ? "Benutzerdefinierter Betrag"
                : "Custom Amount"
            }
            checked={useCustomAmount}
            onChange={(event) =>
              setUseCustomAmount(event.currentTarget.checked)
            }
          />

          {useCustomAmount ? (
            <NumberInput
              allowLeadingZeros={false}
              label={locale === "de-DE" ? "Auszahlungsbetrag" : "Payout Amount"}
              placeholder={
                locale === "de-DE" ? "Betrag eingeben" : "Enter amount"
              }
              min={0}
              max={availablePayout}
              step={0.01}
              value={payoutAmount}
              onChange={(value) =>
                setPayoutAmount(typeof value === "number" ? value : 0)
              }
              rightSection={
                <Text size="xs" c="dimmed">
                  {helper.getCurrencySymbol(project.currency)}
                </Text>
              }
            />
          ) : (
            <Text size="sm" c="dimmed">
              {locale === "de-DE"
                ? "Wird den vollen verfügbaren Betrag auszahlen:"
                : "Will payout full available amount:"}{" "}
              {helper.formatMoney(availablePayout, project.currency, locale)}
            </Text>
          )}

          <Button
            onClick={handleProjectSalaryPayout}
            disabled={
              useCustomAmount
                ? payoutAmount <= 0 || payoutAmount > availablePayout
                : false
            }
            fullWidth
            color="teal"
            leftSection={<IconBrandCashapp size={16} />}
          >
            {`Payout ${useCustomAmount ? helper.formatMoney(payoutAmount, project.currency, locale) : helper.formatMoney(availablePayout, project.currency, locale)}`}
          </Button>
        </>
      ) : (
        <Alert icon={<IconAlertCircle size={16} />} color="blue">
          {locale === "de-DE"
            ? "Kein Auszahlungsbetrag verfügbar - Projektgehalt bereits vollständig ausgezahlt"
            : "No payout available - project salary already fully paid"}
        </Alert>
      )}
    </Stack>
  );
}
