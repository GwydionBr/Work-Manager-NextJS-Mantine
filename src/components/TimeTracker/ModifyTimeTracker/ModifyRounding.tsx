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
  Switch,
  Collapse,
} from "@mantine/core";
import {
  IconSettings,
  IconClock,
  IconAlertCircle,
  IconInfoCircle,
} from "@tabler/icons-react";
import {
  getRoundingInTimeFragments,
  getRoundingModes,
} from "@/constants/settings";
import { RoundingDirection } from "@/types/settings.types";
import { getRoundedSeconds } from "@/utils/workHelperFunctions";
import { TimerRoundingSettings } from "@/types/timeTracker.types";
import { getRoundingLabel } from "@/utils/timeTrackerFunctions";

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
  const [roundingSettings, setRoundingSettings] =
    useState<TimerRoundingSettings>(timerRoundingSettings);
  const [loading, setLoading] = useState(false);
  const [previewRoundedSeconds, setPreviewRoundedSeconds] = useState(0);

  useEffect(() => {
    // Initialize with current time tracker settings
    setRoundingSettings(timerRoundingSettings);
  }, [timerRoundingSettings]);

  // Calculate preview of rounded seconds
  useEffect(() => {
    const rounded = getRoundedSeconds(
      activeSeconds,
      roundingSettings.roundingInterval,
      roundingSettings.roundingDirection
    );
    setPreviewRoundedSeconds(rounded);
  }, [roundingSettings, activeSeconds]);

  async function handleApplyRounding() {
    setLoading(true);

    // Update time tracker rounding settings only
    setTempTimerRounding(roundingSettings);

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

  const hasChanges = roundingSettings !== timerRoundingSettings;

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
            <Text fw={600}>
              {timerRoundingSettings.roundInTimeFragments
                ? timerRoundingSettings.timeFragmentInterval
                : timerRoundingSettings.roundingInterval}{" "}
              min
            </Text>
          </Box>

          <Box>
            <Text size="sm" c="dimmed" mb="xs">
              {locale === "de-DE" ? "Aktueller Modus" : "Current Mode"}
            </Text>
            <Text fw={600}>
              {getRoundingLabel(
                timerRoundingSettings.roundingDirection,
                timerRoundingSettings.roundInTimeFragments,
                locale
              )}
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
          <Switch
            label={
              locale === "de-DE"
                ? "Runden in Zeitabschnitten"
                : "Round in time fragments"
            }
            checked={roundingSettings.roundInTimeFragments}
            onChange={(event) =>
              setRoundingSettings({
                ...roundingSettings,
                roundInTimeFragments: event.currentTarget.checked,
              })
            }
          />
          <Collapse in={!roundingSettings.roundInTimeFragments}>
            <Group gap="md" align="end">
              <NumberInput
                label={
                  locale === "de-DE" ? "Rundungsintervall" : "Rounding Interval"
                }
                suffix={locale === "de-DE" ? " Minuten" : " minutes"}
                value={roundingSettings.roundingInterval}
                onChange={(value) =>
                  setRoundingSettings({
                    ...roundingSettings,
                    roundingInterval: Number(value),
                  })
                }
                min={1}
                max={1440}
                w={150}
              />
              <Select
                label={locale === "de-DE" ? "Rundungs-Modus" : "Rounding Mode"}
                value={roundingSettings.roundingDirection}
                onChange={(value) =>
                  setRoundingSettings({
                    ...roundingSettings,
                    roundingDirection: value as RoundingDirection,
                  })
                }
                data={getRoundingModes(locale)}
                w={200}
              />
            </Group>
          </Collapse>
          <Collapse in={roundingSettings.roundInTimeFragments}>
            <Group>
              <Select
                w={200}
                data={getRoundingInTimeFragments(locale)}
                label={
                  locale === "de-DE"
                    ? "Zeitabschnittsintervall"
                    : "Time Fragment Interval"
                }
                placeholder={
                  locale === "de-DE"
                    ? "Intervall auswählen"
                    : "Select Default Rounding Amount"
                }
                value={roundingSettings.timeFragmentInterval.toString()}
                onChange={(value) =>
                  setRoundingSettings({
                    ...roundingSettings,
                    timeFragmentInterval: Number(value),
                  })
                }
              />
            </Group>
          </Collapse>

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
