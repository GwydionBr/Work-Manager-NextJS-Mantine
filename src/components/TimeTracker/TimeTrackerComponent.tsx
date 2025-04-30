"use client";

import { useState } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useTimeTracker } from "@/stores/timeTrackerStore";
import { useWorkStore } from "@/stores/workManagerStore";

import { roundTime } from "@/utils/workHelperFunctions";

import { Button, Card, Text, Group, Stack, Badge, Paper } from "@mantine/core";
import {
  IconClock,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerStop,
  IconCurrencyDollar,
} from "@tabler/icons-react";
import classes from "./TimeTracker.module.css";

export default function TimeTrackerComponent() {
  const {
    projectTitle,
    moneyEarned,
    activeTime,
    pausedTime,
    state,
    startTimer,
    pauseTimer,
    resumeTimer,
    getCurrentSession,
    stopTimer,
  } = useTimeTracker();

  const { roundingAmount, roundingMode } = useSettingsStore();
  const { addTimerSession } = useWorkStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getStatusColor = () => {
    switch (state) {
      case "running":
        return "green";
      case "paused":
        return "yellow";
      case "stopped":
        return "gray";
      default:
        return "blue";
    }
  };

  async function submitTimer() {
    setErrorMessage(null);
    const newSession = getCurrentSession();
    newSession.active_seconds = roundTime(
      newSession.active_seconds,
      roundingAmount,
      roundingMode
    );
    pauseTimer();
    const result = await addTimerSession(newSession);
    if (result) {
      stopTimer();
    } else {
      setErrorMessage("Fehler beim Speichern der Session");
    }
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Text size="xl" fw={700}>
            {projectTitle}
          </Text>
          <Badge size="lg" color={getStatusColor()}>
            {state}
          </Badge>
        </Group>

        {errorMessage && (
          <Paper p="xs" bg="red.1">
            <Text c="red" size="sm">
              {errorMessage}
            </Text>
          </Paper>
        )}

        <Stack gap="md">
          <Paper
            p="md"
            withBorder
            radius="xl"
            style={{ borderColor: state === "running" ? "yellow" : "" }}
          >
            <Group gap="xs">
              <IconCurrencyDollar size={20} />
              <Text size="lg" fw={500}>
                {moneyEarned} $
              </Text>
            </Group>
          </Paper>
          <Paper
            p="md"
            withBorder
            radius="xl"
            style={{ borderColor: state === "running" ? "red" : "" }}
          >
            <Group gap="xs">
              <IconClock size={20} />
              <Text size="lg" fw={500}>
                {activeTime}
              </Text>
            </Group>
          </Paper>
          <Paper
            p="md"
            withBorder
            radius="xl"
            style={{ borderColor: state === "paused" ? "blue" : "" }}
          >
            <Group gap="xs">
              <IconPlayerPause size={20} />
              <Text size="lg" fw={500}>
                {pausedTime}
              </Text>
            </Group>
          </Paper>
        </Stack>

        <Stack gap="md">
          {state === "stopped" && (
            <Button
              onClick={startTimer}
              color="green"
              leftSection={<IconPlayerPlay size={20} />}
              size="md"
            >
              Start
            </Button>
          )}
          {state === "running" && (
            <Button
              onClick={pauseTimer}
              color="yellow"
              leftSection={<IconPlayerPause size={20} />}
              size="md"
            >
              Pause
            </Button>
          )}
          {state === "paused" && (
            <Button
              onClick={resumeTimer}
              color="blue"
              leftSection={<IconPlayerPlay size={20} />}
              size="md"
            >
              Weiter
            </Button>
          )}
          {state !== "stopped" && (
            <Button
              onClick={submitTimer}
              color="red"
              leftSection={<IconPlayerStop size={20} />}
              size="md"
            >
              Stop
            </Button>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}
