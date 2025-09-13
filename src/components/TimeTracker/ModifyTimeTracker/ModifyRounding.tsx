"use client";

import { useState, useEffect } from "react";
import { useSettingsStore } from "@/stores/settingsStore";

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
import { getRoundingModes } from "@/constants/settings";
import { RoundingDirection } from "@/types/settings.types";
import { getRoundedSeconds } from "@/utils/workHelperFunctions";
import { TimerRoundingSettings } from "@/types/timeTracker.types";

interface ModifyRoundingProps {
  setTempTimerRounding: (timerRoundingSettings: TimerRoundingSettings) => void;
  activeSeconds: number;
  timerRoundingSettings: TimerRoundingSettings;
}

export default function ModifyRounding({
  setTempTimerRounding,
  activeSeconds,
  timerRoundingSettings,
}: ModifyRoundingProps) {
  const { locale } = useSettingsStore();
  const [selectedRoundingInterval, setSelectedRoundingInterval] =
    useState<number>(timerRoundingSettings.roundingInterval);
  const [selectedRoundingDirection, setSelectedRoundingDirection] =
    useState<RoundingDirection>(
      timerRoundingSettings.roundingDirection as RoundingDirection
    );
  const [loading, setLoading] = useState(false);
  const [previewRoundedSeconds, setPreviewRoundedSeconds] = useState(0);

  useEffect(() => {
    // Initialize with current time tracker settings
    setSelectedRoundingInterval(timerRoundingSettings.roundingInterval);
    setSelectedRoundingDirection(
      timerRoundingSettings.roundingDirection as RoundingDirection
    );
  }, [
    timerRoundingSettings.roundingInterval,
    timerRoundingSettings.roundingDirection,
  ]);

  // Calculate preview of rounded seconds
  useEffect(() => {
    const rounded = getRoundedSeconds(
      activeSeconds,
      selectedRoundingInterval,
      selectedRoundingDirection
    );
    setPreviewRoundedSeconds(rounded);
  }, [selectedRoundingInterval, selectedRoundingDirection, activeSeconds]);

  async function handleApplyRounding() {
    setLoading(true);

    // Update time tracker rounding settings only
    setTempTimerRounding({
      roundingInterval: selectedRoundingInterval,
      roundingDirection: selectedRoundingDirection,
      roundInTimeFragments: timerRoundingSettings.roundInTimeFragments,
      timeFragmentInterval: timerRoundingSettings.timeFragmentInterval,
    });

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
    selectedRoundingInterval !== timerRoundingSettings.roundingInterval ||
    selectedRoundingDirection !== timerRoundingSettings.roundingDirection;

  return (
    <Stack gap="lg">
      {/* Current Rounding Settings */}
      <Card withBorder shadow="sm" radius="md" p="lg">
        <Group justify="space-between" mb="md">
          <Title order={4} c="dimmed">
            <IconSettings size={18} style={{ marginRight: "8px" }} />
            {locale === "de-DE"
              ? "Aktuelle Rundungs-Einstellungen"
              : "Current Rounding Settings"}
          </Title>
        </Group>

        <Group gap="xl" justify="center">
          <Box>
            <Text size="sm" c="dimmed" mb="xs">
              {locale === "de-DE" ? "Aktuelle Rundung" : "Current Rounding"}
            </Text>
            <Text fw={600}>{timerRoundingSettings.roundingInterval} min</Text>
          </Box>

          <Box>
            <Text size="sm" c="dimmed" mb="xs">
              {locale === "de-DE" ? "Aktueller Modus" : "Current Mode"}
            </Text>
            <Text fw={600}>
              {
                getRoundingModes(locale).find(
                  (r) => r.value === timerRoundingSettings.roundingDirection
                )?.label
              }
            </Text>
          </Box>
        </Group>
      </Card>

      {/* Rounding Configuration */}
      <Card withBorder shadow="sm" radius="md" p="lg">
        <Title order={4} mb="md" c="dimmed">
          <IconSettings size={18} style={{ marginRight: "8px" }} />
          {locale === "de-DE"
            ? "Rundungs-Einstellungen"
            : "Rounding Configuration"}
        </Title>

        <Stack gap="md">
          <Group gap="md" align="end">
            <NumberInput
              label={
                locale === "de-DE" ? "Rundungsintervall" : "Rounding Interval"
              }
              suffix={locale === "de-DE" ? " Minuten" : " minutes"}
              value={selectedRoundingInterval}
              onChange={(value) => setSelectedRoundingInterval(Number(value))}
              min={1}
              max={1440}
              w={150}
            />
          </Group>

          <Select
            label={locale === "de-DE" ? "Rundungs-Modus" : "Rounding Mode"}
            value={selectedRoundingDirection}
            onChange={(value) =>
              setSelectedRoundingDirection(value as RoundingDirection)
            }
            data={getRoundingModes(locale)}
            w={200}
          />

          {hasChanges && (
            <Button
              onClick={handleApplyRounding}
              loading={loading}
              disabled={loading}
              leftSection={<IconSettings size={16} />}
            >
              {locale === "de-DE"
                ? "Rundungs-Einstellungen anwenden"
                : "Apply Rounding Settings"}
            </Button>
          )}
        </Stack>
      </Card>

      {/* Preview */}
      <Card withBorder shadow="sm" radius="md" p="lg">
        <Title order={4} mb="md" c="dimmed">
          <IconClock size={18} style={{ marginRight: "8px" }} />
          {locale === "de-DE" ? "Rundungs-Vorschau" : "Rounding Preview"}
        </Title>

        <Stack gap="md">
          <Group gap="xl" justify="center">
            <Box>
              <Text size="sm" c="dimmed" mb="xs">
                {locale === "de-DE" ? "Aktive Zeit" : "Current Active Time"}
              </Text>
              <Text fw={600} c="blue.7">
                {formatTime(activeSeconds)}
              </Text>
            </Box>

            <Box>
              <Text size="sm" c="dimmed" mb="xs">
                {locale === "de-DE"
                  ? "Gerundete aktive Zeit"
                  : "Rounded Active Time"}
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
                {locale === "de-DE"
                  ? "Zeit wird angepasst um"
                  : "Time will be adjusted by"}
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
          {locale === "de-DE"
            ? "Hinweis: Rundungs-Einstellungen beeinflussen, wie die Zeit berechnet und gespeichert wird. Die Rundungsänderungen werden nur für diesen Zeitrechner beibehalten."
            : "Note: Rounding settings affect how time is calculated and saved. The rounding changes are kept for this time tracker only."}
        </Text>
      </Paper>
    </Stack>
  );
}
