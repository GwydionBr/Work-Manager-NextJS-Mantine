"use client";

import { TimerState } from "@/stores/timeTrackerStore";

import {
  Button,
  Card,
  Text,
  Group,
  Stack,
  Badge,
  Paper,
  ActionIcon,
  Collapse,
  Indicator,
} from "@mantine/core";
import {
  IconClock,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerStop,
  IconCurrencyDollar,
  IconCurrencyEuro,
  IconX,
  IconStopwatch,
} from "@tabler/icons-react";
import TimeTrackerRow from "./TimeTrackerRow";

import classes from "./TimeTracker.module.css";

interface TimeTrackerComponentBigProps {
  isTimeTrackerMinimized: boolean;
  setIsTimeTrackerMinimized: (value: boolean) => void;
  state: TimerState;
  projectTitle: string;
  moneyEarned: string;
  activeTime: string;
  pausedTime: string;
  currency: string;
  errorMessage: string | null;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  submitTimer: () => void;
  cancelTimer: () => void;
  getStatusColor: () => string;
}

export default function TimeTrackerComponentBig({
  isTimeTrackerMinimized,
  setIsTimeTrackerMinimized,
  state,
  projectTitle,
  moneyEarned,
  activeTime,
  pausedTime,
  currency,
  errorMessage,
  startTimer,
  pauseTimer,
  resumeTimer,
  submitTimer,
  cancelTimer,
  getStatusColor,
}: TimeTrackerComponentBigProps) {
  return (
    <Stack align="center" w="100%">
      <Indicator
        color="red"
        size={10}
        processing={state === "running"}
        disabled={state === "stopped"}
      >
        <ActionIcon
          onClick={() => setIsTimeTrackerMinimized(!isTimeTrackerMinimized)}
          size="md"
          color={getStatusColor()}
        >
          <IconStopwatch />
        </ActionIcon>
      </Indicator>
      <Collapse in={isTimeTrackerMinimized} transitionDuration={400}>
        <Card shadow="sm" padding="xs" radius="md" withBorder w={270}>
          <Group align="center" justify="center" gap="xs">
            <Card shadow="sm" padding="xs" radius="md" withBorder>
              <Stack>
                <Text size="xs" c="dimmed">
                  Active
                </Text>
                <Text size="xs" fw={state === "running" ? 700 : 400}>
                  {activeTime}
                </Text>
              </Stack>
            </Card>
            <Card shadow="sm" padding="xs" radius="md" withBorder>
              <Stack>
                <Text size="xs" c="dimmed">
                  Paused
                </Text>
                <Text size="xs" fw={state === "paused" ? 700 : 400}>
                  {pausedTime}
                </Text>
              </Stack>
            </Card>
            {state === "stopped" && (
              <ActionIcon onClick={startTimer} size="md" color="lime">
                <IconPlayerPlay />
              </ActionIcon>
            )}
            {state === "running" && (
              <ActionIcon onClick={pauseTimer} size="md" color="yellow">
                <IconPlayerPause />
              </ActionIcon>
            )}
            {state === "paused" && (
              <ActionIcon onClick={resumeTimer} size="md" color="blue">
                <IconPlayerPlay />
              </ActionIcon>
            )}
            <Collapse
              in={state === "running" || state === "paused"}
              transitionDuration={400}
            >
              <Group gap="xs" align="center" justify="center">
                <ActionIcon onClick={submitTimer} size="md" color="red">
                  <IconPlayerStop />
                </ActionIcon>
                <ActionIcon onClick={cancelTimer} size="md" color="gray">
                  <IconX />
                </ActionIcon>
              </Group>
            </Collapse>
          </Group>
        </Card>
      </Collapse>
      <Collapse in={!isTimeTrackerMinimized} transitionDuration={400}>
        <Card
          shadow="sm"
          padding="lg"
          radius="md"
          withBorder
          w={270}
          className={classes.timeTrackerContainer}
        >
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
                <Text c="red.9" size="sm">
                  {errorMessage}
                </Text>
              </Paper>
            )}

            <Stack gap="md">
              <TimeTrackerRow
                icon={
                  currency === "EUR" ? (
                    <IconCurrencyEuro size={20} />
                  ) : (
                    <IconCurrencyDollar size={20} />
                  )
                }
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
                  color="lime"
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
                  Resume
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
                    Cancel
                  </Button>
                </Stack>
              )}
            </Stack>
          </Stack>
        </Card>
      </Collapse>
    </Stack>
  );
}
