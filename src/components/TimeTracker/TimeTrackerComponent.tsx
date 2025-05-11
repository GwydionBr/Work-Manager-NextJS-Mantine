"use client";

import { useState } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useTimeTracker, TimerState } from "@/stores/timeTrackerStore";
import { useWorkStore } from "@/stores/workManagerStore";

import { roundTime } from "@/utils/workHelperFunctions";

import { Button, Card, Text, Group, Stack, Badge, Paper } from "@mantine/core";
import {
  IconClock,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerStop,
  IconCurrencyDollar,
  IconCurrencyEuro,
  IconX,
} from "@tabler/icons-react";

import TimeTrackerRow from "./TimeTrackerRow";

export default function TimeTrackerComponent() {
  const {
    projectTitle,
    moneyEarned,
    activeTime,
    pausedTime,
    currency,
    state,
    startTimer,
    pauseTimer,
    resumeTimer,
    getCurrentSession,
    stopTimer,
    cancelTimer,
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
    <Card shadow="sm" padding="lg" radius="md" withBorder miw={270}>
      <Stack gap="md" align="center">
        <Badge size="lg" color={getStatusColor()}>
          {state}
        </Badge>
        <Group justify="space-between" align="center">
          <Text size="xl" fw={700}>
            {projectTitle}
          </Text>
        </Group>

        {errorMessage && (
          <Paper p="xs" bg="red.1">
            <Text c="red" size="sm">
              {errorMessage}
            </Text>
          </Paper>
        )}

        <Stack gap="md">
          <TimeTrackerRow
            icon={currency === "EUR" ?  <IconCurrencyEuro size={20} /> : <IconCurrencyDollar size={20} />}
            value={moneyEarned}
            state={state}
            activationState={TimerState.Running}
            color="yellow"
          />
          <TimeTrackerRow
            icon={<IconClock size={20} />}
            value={activeTime}
            state={state}
            activationState={TimerState.Running}
            color="red"
          />
          <TimeTrackerRow
            icon={<IconPlayerPause size={20} />}
            value={pausedTime}
            state={state}
            activationState={TimerState.Paused}
            color="blue"
          />
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
            <Stack gap="md">
              <Button
                onClick={submitTimer}
                color="red"
                leftSection={<IconPlayerStop size={20} />}
                size="md"
              >
                Stop
              </Button>
              <Button
                onClick={cancelTimer}
                color="gray"
                leftSection={<IconX size={20} />}
                size="md"
              >
                Abbrechen
              </Button>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}
