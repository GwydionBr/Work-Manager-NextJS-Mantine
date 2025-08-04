"use client";

import { useState } from "react";
import { useWorkStore } from "@/stores/workManagerStore";
import { useFinanceStore } from "@/stores/financeStore";

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

import * as helper from "@/utils/workHelperFunctions";

import type { Tables } from "@/types/db.types";

interface HourlyPayoutMenuProps {
  opened: boolean;
  isOverview?: boolean;
  unpaidSessions: Tables<"timerSession">[];
  selectedUnpaidSessions: string[];
  sessionPayouts: Record<string, number>;
  projects: Tables<"timerProject">[];
  closeMenu: () => void;
  onSessionsChange: (sessions: string[]) => void;
  openModal: () => void;
  handleSelectAll: () => void;
  handleSessionToggle: (sessionId: string) => void;
}
export default function HourlyPayoutMenu({
  opened,
  isOverview,
  unpaidSessions,
  selectedUnpaidSessions,
  sessionPayouts,
  projects,
  closeMenu,
  onSessionsChange,
  openModal,
  handleSelectAll,
  handleSessionToggle,
}: HourlyPayoutMenuProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { payoutSessions } = useWorkStore();
  const { fetchFinanceData } = useFinanceStore();

  const handleSessionPayout = async () => {
    closeMenu();
    openModal();
    // if (selectedUnpaidSessions.length === 0) return;

    // setIsProcessing(true);
    // try {
    //   const success = await payoutSessions(selectedUnpaidSessions);
    //   if (success) {
    //     // Refresh finance data to show new income entries
    //     await fetchFinanceData();
    //     // Clear selected sessions
    //     onSessionsChange([]);
    //   }
    // } finally {
    //   setIsProcessing(false);
    // }
  };
  return (
    <Stack p="md" gap="md">
      <Text size="sm" fw={500}>
        {isOverview
          ? "Select Sessions for Payout (All Projects)"
          : "Select Sessions for Payout"}
      </Text>

      {unpaidSessions.length === 0 ? (
        <Alert icon={<IconAlertCircle size={16} />} color="blue">
          All sessions are already paid
        </Alert>
      ) : (
        <>
          <Checkbox
            label={`Select All (${unpaidSessions.length} unpaid sessions)`}
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
                          {helper.formatDate(new Date(session.start_time))}
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
                              helper.getCurrencySymbol(session.currency)
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
                  Payout Summary:
                </Text>
                {Object.entries(sessionPayouts).map(([currency, amount]) => (
                  <Text key={currency} size="sm">
                    {helper.formatMoney(
                      amount,
                      helper.getCurrencySymbol(currency as any)
                    )}
                  </Text>
                ))}
                <Text size="sm" fw={500} c="teal">
                  Total:{" "}
                  {Object.entries(sessionPayouts)
                    .map(([currency, amount]) =>
                      helper.formatMoney(
                        amount,
                        helper.getCurrencySymbol(currency as any)
                      )
                    )
                    .join(", ")}
                </Text>
              </Stack>

              <Button
                onClick={handleSessionPayout}
                loading={isProcessing}
                disabled={selectedUnpaidSessions.length === 0}
                fullWidth
                color="teal"
                leftSection={<IconBrandCashapp size={16} />}
              >
                {isProcessing
                  ? "Processing..."
                  : `Payout ${selectedUnpaidSessions.length} Session${selectedUnpaidSessions.length > 1 ? "s" : ""}`}
              </Button>
            </>
          )}
        </>
      )}
    </Stack>
  );
}
