"use client";

import { useState, useEffect } from "react";
import { useTimeTracker } from "@/stores/timeTrackerStore";

import {
  Stack,
  Text,
  Box,
  Group,
  Button,
  Card,
  Title,
  Select,
  NumberInput,
  Alert,
  Paper,
} from "@mantine/core";
import {
  IconSettings,
  IconClock,
  IconAlertCircle,
  IconInfoCircle,
} from "@tabler/icons-react";
import { roundingAmounts, roundingModes } from "@/constants/settings";
import { RoundingAmount, RoundingDirection } from "@/types/settings.types";
import { getRoundedSeconds } from "@/utils/workHelperFunctions";

export default function ModifyRounding() {
  const { setRoundingAmount, activeSeconds, roundingMode, roundingInterval } =
    useTimeTracker();

  const [selectedRoundingAmount, setSelectedRoundingAmount] =
    useState<RoundingAmount>("min");
  const [selectedRoundingMode, setSelectedRoundingMode] =
    useState<RoundingDirection>(roundingMode as RoundingDirection);
  const [customAmount, setCustomAmount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [previewRoundedSeconds, setPreviewRoundedSeconds] = useState(0);

  // Convert rounding interval to rounding amount
  const getRoundingAmountFromInterval = (interval: number): RoundingAmount => {
    switch (interval) {
      case 1:
        return "s";
      case 60:
        return "min";
      case 900:
        return "1/4h";
      case 1800:
        return "1/2h";
      case 3600:
        return "h";
      default:
        return "custom";
    }
  };

  // Convert rounding amount to interval
  const getIntervalFromRoundingAmount = (
    amount: RoundingAmount,
    custom: number
  ): number => {
    switch (amount) {
      case "s":
        return 1;
      case "min":
        return 60;
      case "1/4h":
        return 900;
      case "1/2h":
        return 1800;
      case "h":
        return 3600;
      case "custom":
        return custom * 60;
      default:
        return 60;
    }
  };

  useEffect(() => {
    // Initialize with current time tracker settings
    setSelectedRoundingAmount(getRoundingAmountFromInterval(roundingInterval));
    setSelectedRoundingMode(roundingMode as RoundingDirection);
    setCustomAmount(roundingInterval / 60);
  }, [roundingInterval, roundingMode]);

  // Calculate preview of rounded seconds
  useEffect(() => {
    const interval = getIntervalFromRoundingAmount(
      selectedRoundingAmount,
      customAmount
    );
    const rounded = getRoundedSeconds(
      activeSeconds,
      interval,
      selectedRoundingMode
    );
    setPreviewRoundedSeconds(rounded);
  }, [
    selectedRoundingAmount,
    selectedRoundingMode,
    customAmount,
    activeSeconds,
  ]);

  async function handleApplyRounding() {
    setLoading(true);

    // Update time tracker rounding settings only
    setRoundingAmount(
      selectedRoundingAmount,
      selectedRoundingMode,
      customAmount
    );

    setLoading(false);
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const hasChanges =
    selectedRoundingAmount !==
      getRoundingAmountFromInterval(roundingInterval) ||
    selectedRoundingMode !== roundingMode ||
    customAmount !== roundingInterval / 60;

  return (
    <Stack gap="lg">
      {/* Current Rounding Settings */}
      <Card withBorder shadow="sm" radius="md" p="lg">
        <Group justify="space-between" mb="md">
          <Title order={4} c="dimmed">
            <IconSettings size={18} style={{ marginRight: "8px" }} />
            Current Rounding Settings
          </Title>
        </Group>

        <Group gap="xl" justify="center">
          <Box>
            <Text size="sm" c="dimmed" mb="xs">
              Current Rounding
            </Text>
            <Text fw={600}>
              {
                roundingAmounts.find(
                  (r) =>
                    r.value === getRoundingAmountFromInterval(roundingInterval)
                )?.label
              }
              {getRoundingAmountFromInterval(roundingInterval) === "custom" &&
                ` (${Math.round(roundingInterval / 60)} min)`}
            </Text>
          </Box>

          <Box>
            <Text size="sm" c="dimmed" mb="xs">
              Current Mode
            </Text>
            <Text fw={600}>
              {roundingModes.find((r) => r.value === roundingMode)?.label}
            </Text>
          </Box>
        </Group>
      </Card>

      {/* Rounding Configuration */}
      <Card withBorder shadow="sm" radius="md" p="lg">
        <Title order={4} mb="md" c="dimmed">
          <IconSettings size={18} style={{ marginRight: "8px" }} />
          Rounding Configuration
        </Title>

        <Stack gap="md">
          <Group gap="md" align="end">
            <Select
              label="Rounding Amount"
              value={selectedRoundingAmount}
              onChange={(value) =>
                setSelectedRoundingAmount(value as RoundingAmount)
              }
              data={roundingAmounts}
              w={200}
            />

            {selectedRoundingAmount === "custom" && (
              <NumberInput
                label="Custom Amount (minutes)"
                value={customAmount}
                onChange={(value) => setCustomAmount(Number(value))}
                min={1}
                max={1440}
                w={150}
              />
            )}
          </Group>

          <Select
            label="Rounding Mode"
            value={selectedRoundingMode}
            onChange={(value) =>
              setSelectedRoundingMode(value as RoundingDirection)
            }
            data={roundingModes}
            w={200}
          />

          {hasChanges && (
            <Button
              onClick={handleApplyRounding}
              loading={loading}
              disabled={loading}
              leftSection={<IconSettings size={16} />}
            >
              Apply Rounding Settings
            </Button>
          )}
        </Stack>
      </Card>

      {/* Preview */}
      <Card withBorder shadow="sm" radius="md" p="lg">
        <Title order={4} mb="md" c="dimmed">
          <IconClock size={18} style={{ marginRight: "8px" }} />
          Rounding Preview
        </Title>

        <Stack gap="md">
          <Group gap="xl" justify="center">
            <Box>
              <Text size="sm" c="dimmed" mb="xs">
                Current Active Time
              </Text>
              <Text fw={600} c="blue.7">
                {formatTime(activeSeconds)}
              </Text>
            </Box>

            <Box>
              <Text size="sm" c="dimmed" mb="xs">
                Rounded Active Time
              </Text>
              <Text fw={600} c="green.7">
                {formatTime(previewRoundedSeconds)}
              </Text>
            </Box>
          </Group>

          {activeSeconds !== previewRoundedSeconds && (
            <Alert
              icon={<IconInfoCircle size="1rem" />}
              color="blue"
              variant="light"
              radius="md"
            >
              <Text size="sm">
                Time will be adjusted by{" "}
                {formatTime(Math.abs(previewRoundedSeconds - activeSeconds))}(
                {previewRoundedSeconds > activeSeconds ? "+" : "-"})
              </Text>
            </Alert>
          )}
        </Stack>
      </Card>

      <Paper
        p="md"
        radius="md"
        bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))"
        withBorder
      >
        <Text size="xs" c="dimmed" ta="center" style={{ lineHeight: 1.4 }}>
          <IconAlertCircle
            size={12}
            style={{ marginRight: "4px", verticalAlign: "middle" }}
          />
          Note: Rounding settings affect how time is calculated and saved. The
          rounding changes will stay until you restart the app.
        </Text>
      </Paper>
    </Stack>
  );
}
