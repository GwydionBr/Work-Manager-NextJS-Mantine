"use client";

import { useSettingsStore } from "@/stores/settingsStore";

import {
  Button,
  Text,
  Checkbox,
  Stack,
  Group,
  Divider,
  Alert,
} from "@mantine/core";
import { IconBrandCashapp, IconAlertCircle } from "@tabler/icons-react";

import * as helper from "@/utils/formatFunctions";

import type { Tables } from "@/types/db.types";
import { Currency } from "@/types/settings.types";

interface HourlyPayoutMenuProps {
  isOverview?: boolean;
  unpaidSessions: Tables<"timer_session">[];
  selectedUnpaidSessions: string[];
  sessionPayouts: Record<string, number>;
  projects: Tables<"timer_project">[];
  openModal: () => void;
  handleSelectAll: () => void;
  handleSessionToggle: (sessionId: string) => void;
}
export default function HourlyPayoutMenu({
  isOverview,
  unpaidSessions,
  selectedUnpaidSessions,
  sessionPayouts,
  projects,
  openModal,
  handleSelectAll,
  handleSessionToggle,
}: HourlyPayoutMenuProps) {
  const { locale } = useSettingsStore();

  const handleSessionPayout = async () => {
    openModal();
  };
  return (
    <Stack p="md" gap="md">
      <Text size="sm" fw={500}>
        {isOverview
          ? locale === "de-DE"
            ? "Sitzungen für Auszahlung auswählen (Alle Projekte)"
            : "Select Sessions for Payout (All Projects)"
          : locale === "de-DE"
            ? "Sitzungen für Auszahlung auswählen"
            : "Select Sessions for Payout"}
      </Text>

      {unpaidSessions.length === 0 ? (
        <Alert icon={<IconAlertCircle size={16} />} color="blue">
          {locale === "de-DE"
            ? "Alle Sitzungen sind bereits ausgezahlt"
            : "All sessions are already paid"}
        </Alert>
      ) : (
        <>
          <Checkbox
            label={`${locale === "de-DE" ? "Alle auswählen" : "Select All"} (${unpaidSessions.length} ${locale === "de-DE" ? "unbezahlte Sitzungen" : "unpaid sessions"})`}
            checked={
              selectedUnpaidSessions.length === unpaidSessions.length &&
              unpaidSessions.length > 0
            }
            indeterminate={
              selectedUnpaidSessions.length > 0 &&
              selectedUnpaidSessions.length < unpaidSessions.length
            }
            onChange={handleSelectAll}
          />

          <Divider />

          <Stack gap="xs" style={{ maxHeight: 200, overflowY: "auto" }}>
            {unpaidSessions.map((session) => {
              const earnings = session.hourly_payment
                ? Number(
                    ((session.active_seconds * session.salary) / 3600).toFixed(
                      2
                    )
                  )
                : 0;

              const sessionProject = projects?.find(
                (p) => p.id === session.project_id
              );

              return (
                <Checkbox
                  key={session.id}
                  label={
                    <Group justify="space-between" w="100%">
                      <Stack gap={5}>
                        <Text size="sm" truncate>
                          {helper.formatDate(
                            new Date(session.start_time),
                            locale
                          )}
                        </Text>
                        {isOverview && sessionProject && (
                          <Text size="xs" c="dimmed" ml="xs">
                            - {sessionProject.title}
                          </Text>
                        )}
                      </Stack>
                      <Text size="sm" c="dimmed">
                        {session.hourly_payment
                          ? helper.formatMoney(
                              earnings,
                              session.currency,
                              locale
                            )
                          : "No payment"}
                      </Text>
                    </Group>
                  }
                  checked={selectedUnpaidSessions.includes(session.id)}
                  onChange={() => handleSessionToggle(session.id)}
                />
              );
            })}
          </Stack>

          {selectedUnpaidSessions.length > 0 && (
            <>
              <Divider />
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  {locale === "de-DE" ? "Auszahlungssumme" : "Payout Summary"}:
                </Text>
                {Object.entries(sessionPayouts).map(([currency, amount]) => (
                  <Text key={currency} size="sm">
                    {helper.formatMoney(amount, currency as Currency, locale)}
                  </Text>
                ))}
                <Text size="sm" fw={500} c="teal">
                  {locale === "de-DE" ? "Gesamt" : "Total"}:{" "}
                  {Object.entries(sessionPayouts)
                    .map(([currency, amount]) =>
                      helper.formatMoney(amount, currency as Currency, locale)
                    )
                    .join(", ")}
                </Text>
              </Stack>

              <Button
                onClick={handleSessionPayout}
                disabled={selectedUnpaidSessions.length === 0}
                fullWidth
                color="teal"
                leftSection={<IconBrandCashapp size={16} />}
              >
                {`${locale === "de-DE" ? "Zahle" : "Payout"} ${selectedUnpaidSessions.length} ${locale === "de-DE" ? "Sitzung" : "Session"}${selectedUnpaidSessions.length > 1 ? (locale === "de-DE" ? "en aus" : "s") : locale === "de-DE" ? " aus" : ""}`}
              </Button>
            </>
          )}
        </>
      )}
    </Stack>
  );
}
