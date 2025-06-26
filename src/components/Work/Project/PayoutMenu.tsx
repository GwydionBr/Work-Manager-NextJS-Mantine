"use client";

import { useState } from "react";
import { useWorkStore } from "@/stores/workManagerStore";
import { useFinanceStore } from "@/stores/financeStore";

import {
  Button,
  Menu,
  Text,
  Checkbox,
  Stack,
  Group,
  Divider,
  Alert,
  NumberInput,
  Switch,
} from "@mantine/core";
import { IconBrandCashapp, IconAlertCircle } from "@tabler/icons-react";

import * as helper from "@/utils/workHelperFunctions";

import type { Tables } from "@/types/db.types";

interface PayoutMenuProps {
  sessions: Tables<"timerSession">[];
  project?: Tables<"timerProject">;
  selectedSessions?: string[];
  onSessionsChange?: (sessions: string[]) => void;
}

export default function PayoutMenu({
  sessions,
  project,
  selectedSessions: externalSelectedSessions,
  onSessionsChange,
}: PayoutMenuProps) {
  const [internalSelectedSessions, setInternalSelectedSessions] = useState<
    string[]
  >([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [useCustomAmount, setUseCustomAmount] = useState(false);
  const { payoutSessions, payoutProjectSalary } = useWorkStore();
  const { fetchFinanceData } = useFinanceStore();

  // Use external state if provided, otherwise use internal state
  const selectedSessions = externalSelectedSessions || internalSelectedSessions;
  const setSelectedSessions = onSessionsChange || setInternalSelectedSessions;

  // Filter out already paid sessions
  const unpaidSessions = sessions.filter((session) => !session.payed);

  // Filter selected sessions to only include unpaid ones
  const selectedUnpaidSessions = selectedSessions.filter((id) =>
    unpaidSessions.some((session) => session.id === id)
  );

  // Calculate available payout for non-hourly payment projects
  const calculateAvailablePayout = () => {
    if (!project || project.hourly_payment) return 0;

    const totalSalary = project.salary;
    const alreadyPaid = project.total_payout || 0;
    return Math.max(0, totalSalary - alreadyPaid);
  };

  const availablePayout = calculateAvailablePayout();

  const handleSessionToggle = (sessionId: string) => {
    if (onSessionsChange) {
      // External state management
      onSessionsChange(
        selectedSessions.includes(sessionId)
          ? selectedSessions.filter((id) => id !== sessionId)
          : [...selectedSessions, sessionId]
      );
    } else {
      // Internal state management
      setInternalSelectedSessions((prev) =>
        prev.includes(sessionId)
          ? prev.filter((id) => id !== sessionId)
          : [...prev, sessionId]
      );
    }
  };

  const handleSelectAll = () => {
    if (onSessionsChange) {
      // External state management
      if (selectedUnpaidSessions.length === unpaidSessions.length) {
        onSessionsChange([]);
      } else {
        onSessionsChange(unpaidSessions.map((s) => s.id));
      }
    } else {
      // Internal state management
      if (internalSelectedSessions.length === unpaidSessions.length) {
        setInternalSelectedSessions([]);
      } else {
        setInternalSelectedSessions(unpaidSessions.map((s) => s.id));
      }
    }
  };

  const calculateSessionPayout = () => {
    const selectedSessionData = sessions.filter((s) =>
      selectedUnpaidSessions.includes(s.id)
    );

    // Group by currency
    const payoutsByCurrency = selectedSessionData.reduce(
      (acc, session) => {
        const currency = session.currency;
        const earnings = session.hourly_payment
          ? Number(
              ((session.active_seconds * session.salary) / 3600).toFixed(2)
            )
          : 0;

        if (!acc[currency]) {
          acc[currency] = 0;
        }
        acc[currency] += earnings;
        return acc;
      },
      {} as Record<string, number>
    );

    return payoutsByCurrency;
  };

  const handleSessionPayout = async () => {
    if (selectedUnpaidSessions.length === 0) return;

    setIsProcessing(true);
    try {
      const success = await payoutSessions(selectedUnpaidSessions);
      if (success) {
        // Refresh finance data to show new income entries
        await fetchFinanceData();
        // Clear selected sessions
        if (onSessionsChange) {
          onSessionsChange([]);
        } else {
          setInternalSelectedSessions([]);
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSalaryPayout = async () => {
    if (!project || project.hourly_payment) return;

    const amount = useCustomAmount ? payoutAmount : availablePayout;
    if (amount <= 0 || amount > availablePayout) return;

    setIsProcessing(true);
    try {
      const success = await payoutProjectSalary(project.id, amount);
      if (success) {
        // Refresh finance data to show new income entries
        await fetchFinanceData();
        // Reset form
        setPayoutAmount(0);
        setUseCustomAmount(false);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const sessionPayouts = calculateSessionPayout();

  // Render different UI based on project type
  if (project && !project.hourly_payment) {
    // Non-hourly payment project - salary-based payout
    return (
      <Menu
        trigger="click-hover"
        width={300}
        position="bottom-start"
        transitionProps={{ transition: "pop-top-left", duration: 250 }}
      >
        <Menu.Target>
          <Button
            variant="light"
            size="md"
            color="teal"
            disabled={availablePayout === 0}
            leftSection={<IconBrandCashapp size={20} />}
            loading={isProcessing}
          >
            {availablePayout === 0 ? "All Paid" : "Payout"}
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Stack p="md" gap="md">
            <Text size="sm" fw={500}>
              Project Salary Payout
            </Text>

            <Stack gap="xs">
              <Text size="sm" c="dimmed">
                Total Salary:{" "}
                {helper.formatMoney(
                  project.salary,
                  helper.getCurrencySymbol(project.currency)
                )}
              </Text>
              <Text size="sm" c="dimmed">
                Already Paid:{" "}
                {helper.formatMoney(
                  project.total_payout || 0,
                  helper.getCurrencySymbol(project.currency)
                )}
              </Text>
              <Text size="sm" fw={500} c="teal">
                Available:{" "}
                {helper.formatMoney(
                  availablePayout,
                  helper.getCurrencySymbol(project.currency)
                )}
              </Text>
            </Stack>

            {availablePayout > 0 ? (
              <>
                <Divider />

                <Switch
                  label="Custom Amount"
                  checked={useCustomAmount}
                  onChange={(event) =>
                    setUseCustomAmount(event.currentTarget.checked)
                  }
                />

                {useCustomAmount ? (
                  <NumberInput
                    label="Payout Amount"
                    placeholder="Enter amount"
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
                    Will payout full available amount:{" "}
                    {helper.formatMoney(
                      availablePayout,
                      helper.getCurrencySymbol(project.currency)
                    )}
                  </Text>
                )}

                <Button
                  onClick={handleSalaryPayout}
                  loading={isProcessing}
                  disabled={
                    useCustomAmount
                      ? payoutAmount <= 0 || payoutAmount > availablePayout
                      : false
                  }
                  fullWidth
                  color="teal"
                  leftSection={<IconBrandCashapp size={16} />}
                >
                  {isProcessing
                    ? "Processing..."
                    : `Payout ${useCustomAmount ? helper.formatMoney(payoutAmount, helper.getCurrencySymbol(project.currency)) : helper.formatMoney(availablePayout, helper.getCurrencySymbol(project.currency))}`}
                </Button>
              </>
            ) : (
              <Alert icon={<IconAlertCircle size={16} />} color="blue">
                No payout available - project salary already fully paid
              </Alert>
            )}
          </Stack>
        </Menu.Dropdown>
      </Menu>
    );
  }

  // Hourly payment project - session-based payout
  return (
    <Menu
      trigger="click-hover"
      width={350}
      position="bottom-start"
      transitionProps={{ transition: "pop-top-left", duration: 250 }}
    >
      <Menu.Target>
        <Button
          variant="light"
          size="md"
          color="teal"
          disabled={unpaidSessions.length === 0}
          leftSection={<IconBrandCashapp size={20} />}
          loading={isProcessing}
        >
          {unpaidSessions.length === 0 ? "All Paid" : "Payout"}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Stack p="md" gap="md">
          <Text size="sm" fw={500}>
            Select Sessions for Payout
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
                        (
                          (session.active_seconds * session.salary) /
                          3600
                        ).toFixed(2)
                      )
                    : 0;

                  return (
                    <Checkbox
                      key={session.id}
                      label={
                        <Group justify="space-between" w="100%">
                          <Text size="sm" truncate>
                            {helper.formatDate(new Date(session.start_time))}
                          </Text>
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
                    {Object.entries(sessionPayouts).map(
                      ([currency, amount]) => (
                        <Text key={currency} size="sm">
                          {helper.formatMoney(
                            amount,
                            helper.getCurrencySymbol(currency as any)
                          )}
                        </Text>
                      )
                    )}
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
      </Menu.Dropdown>
    </Menu>
  );
}
