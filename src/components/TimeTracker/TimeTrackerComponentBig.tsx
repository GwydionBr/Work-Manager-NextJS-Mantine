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
import StopActionIcon from "./TimeTrackerActionIcons/StopActionIcon";
import CancelActionIcon from "./TimeTrackerActionIcons/CancelActionIcon";
import StartActionIcon from "./TimeTrackerActionIcons/StartActionIcons";
import PauseActionIcon from "./TimeTrackerActionIcons/PauseActionIcon";
import ResumeActionIcon from "./TimeTrackerActionIcons/ResumeActionIcon";
import TimeTrackerActionIcon from "./TimeTrackerActionIcons/TimeTrackerActionIcon";

interface TimeTrackerComponentBigProps {
  isTimeTrackerMinimized: boolean;
  state: TimerState;
  projectTitle: string;
  moneyEarned: string;
  activeTime: string;
  pausedTime: string;
  currency: string;
  hourlyPayment: boolean;
  errorMessage: string | null;
  isSubmitting: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  submitTimer: () => void;
  cancelTimer: () => void;
  getStatusColor: () => string;
  setIsTimeTrackerMinimized: (value: boolean) => void;
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
  hourlyPayment,
  errorMessage,
  isSubmitting,
  startTimer,
  pauseTimer,
  resumeTimer,
  submitTimer,
  cancelTimer,
  getStatusColor,
}: TimeTrackerComponentBigProps) {
  return (
    <Stack align="center" w="100%">
      <TimeTrackerActionIcon
        action={() => setIsTimeTrackerMinimized(!isTimeTrackerMinimized)}
        label={isTimeTrackerMinimized ? "show Timer" : "hide Timer"}
        state={state}
        getStatusColor={getStatusColor}
      />
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
            {state === "stopped" && <StartActionIcon startTimer={startTimer} />}
            {state === "running" && (
              <PauseActionIcon pauseTimer={pauseTimer} loading={isSubmitting} />
            )}
            {state === "paused" && (
              <ResumeActionIcon
                resumeTimer={resumeTimer}
                loading={isSubmitting}
              />
            )}
            <Collapse
              in={state === "running" || state === "paused"}
              transitionDuration={400}
            >
              <Group gap="xs" align="center" justify="center">
                <StopActionIcon
                  stopTimer={submitTimer}
                  loading={isSubmitting}
                />
                <CancelActionIcon
                  cancelTimer={cancelTimer}
                  loading={isSubmitting}
                />
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
            {/* State Badge */}
            <Badge size="lg" color={getStatusColor()}>
              {state}
            </Badge>
            {/* Project Title */}
            <Group justify="space-between" align="center">
              <Text size="xl" fw={700}>
                {projectTitle}
              </Text>
            </Group>

            {/* Error Message */}
            {errorMessage && (
              <Paper p="xs" bg="red.1">
                <Text c="red.9" size="sm">
                  {errorMessage}
                </Text>
              </Paper>
            )}

            {/* Time Tracker Rows */}
            <Stack gap="md">
              {hourlyPayment && (
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
              )}
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

            {/* Buttons */}
            <Stack gap="md" w="100%" align="center">
              {state === "stopped" && (
                <Button
                  w="60%"
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
                  w="60%"
                  onClick={pauseTimer}
                  color="yellow"
                  leftSection={<IconPlayerPause size={20} />}
                  size="md"
                  loading={isSubmitting}
                >
                  Pause
                </Button>
              )}
              {state === "paused" && (
                <Button
                  w="60%"
                  onClick={resumeTimer}
                  color="blue"
                  leftSection={<IconPlayerPlay size={20} />}
                  size="md"
                  loading={isSubmitting}
                >
                  Resume
                </Button>
              )}

              <Collapse
                in={state !== "stopped"}
                transitionDuration={400}
                w="60%"
              >
                <Stack gap="md" align="center">
                  <Button
                    fullWidth
                    onClick={submitTimer}
                    color="red"
                    leftSection={<IconPlayerStop size={20} />}
                    size="md"
                    loading={isSubmitting}
                  >
                    Stop
                  </Button>
                  <Button
                    fullWidth
                    onClick={cancelTimer}
                    color="gray"
                    leftSection={<IconX size={20} />}
                    size="md"
                    loading={isSubmitting}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Collapse>
            </Stack>
          </Stack>
        </Card>
      </Collapse>
    </Stack>
  );
}
