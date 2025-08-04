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
  Collapse,
  LoadingOverlay,
} from "@mantine/core";
import {
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerStop,
  IconCurrencyDollar,
  IconCurrencyEuro,
  IconX,
} from "@tabler/icons-react";
import TimeTrackerRow from "./TimeTrackerRow";

import classes from "./TimeTracker.module.css";
import StopActionIcon from "./TimeTrackerActionIcons/StopActionIcon";
import CancelActionIcon from "./TimeTrackerActionIcons/CancelActionIcon";
import StartActionIcon from "./TimeTrackerActionIcons/StartActionIcons";
import PauseActionIcon from "./TimeTrackerActionIcons/PauseActionIcon";
import ResumeActionIcon from "./TimeTrackerActionIcons/ResumeActionIcon";
import TimeTrackerActionIcon from "./TimeTrackerActionIcons/TimeTrackerActionIcon";
import { RoundingDirection, Currency } from "@/types/settings.types";
import TimeTrackerInfoHoverCard from "./TimeTrackerInfoHoverCard";
import ModifyTimeTrackerModal from "./ModifyTimeTrackerModal";

interface TimeTrackerComponentBigProps {
  isTimeTrackerMinimized: boolean;
  state: TimerState;
  projectTitle: string;
  moneyEarned: string;
  activeTime: string;
  pausedTime: string;
  currency: Currency;
  hourlyPayment: boolean;
  errorMessage: string | null;
  isSubmitting: boolean;
  salary: number;
  roundingMode: RoundingDirection;
  roundingInterval: number;
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
          <LoadingOverlay visible={isSubmitting} overlayProps={{ blur: 2 }} />
          <Group align="center" justify="center" gap="xs">
            <Card
              shadow="sm"
              padding="xs"
              radius="md"
              withBorder
              style={{
                borderColor:
                  state === TimerState.Running
                    ? "var(--mantine-color-blue-6)"
                    : "",
              }}
            >
              <Stack>
                <Text size="xs" c="dimmed">
                  Active
                </Text>
                <Text size="xs" fw={state === "running" ? 700 : 400}>
                  {activeTime}
                </Text>
              </Stack>
            </Card>
            <Card
              shadow="sm"
              padding="xs"
              radius="md"
              withBorder
              style={{
                borderColor:
                  state === TimerState.Paused
                    ? "var(--mantine-color-orange-6)"
                    : "",
              }}
            >
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
              <PauseActionIcon
                pauseTimer={pauseTimer}
                disabled={isSubmitting}
              />
            )}
            {state === "paused" && (
              <ResumeActionIcon
                resumeTimer={resumeTimer}
                disabled={isSubmitting}
              />
            )}
            <Collapse
              in={state === "running" || state === "paused"}
              transitionDuration={400}
            >
              <Group gap="xs" align="center" justify="center">
                <StopActionIcon
                  stopTimer={submitTimer}
                  disabled={isSubmitting}
                />
                <CancelActionIcon
                  cancelTimer={cancelTimer}
                  disabled={isSubmitting}
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
          <LoadingOverlay visible={isSubmitting} overlayProps={{ blur: 2 }} />
          <Stack gap="md" align="center">
            {/* State Badge */}
            <Group justify="space-between" align="center" w="100%">
              <ModifyTimeTrackerModal />
              <Badge size="lg" color={getStatusColor()}>
                {state}
              </Badge>
              <TimeTrackerInfoHoverCard />
            </Group>
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
                      <IconCurrencyEuro
                        size={20}
                        color="var(--mantine-color-grape-6)"
                      />
                    ) : (
                      <IconCurrencyDollar
                        size={20}
                        color="var(--mantine-color-grape-6)"
                      />
                    )
                  }
                  value={moneyEarned}
                  state={state}
                  activationState={TimerState.Running}
                  color="var(--mantine-color-grape-6)"
                />
              )}
              <TimeTrackerRow
                icon={
                  <IconPlayerPlay
                    size={20}
                    color="var(--mantine-color-blue-6)"
                  />
                }
                value={activeTime}
                state={state}
                activationState={TimerState.Running}
                color="var(--mantine-color-blue-6)"
              />
              <TimeTrackerRow
                icon={
                  <IconPlayerPause
                    size={20}
                    color="var(--mantine-color-orange-6)"
                  />
                }
                value={pausedTime}
                state={state}
                activationState={TimerState.Paused}
                color="var(--mantine-color-orange-6)"
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                    disabled={isSubmitting}
                  >
                    Stop
                  </Button>
                  <Button
                    fullWidth
                    onClick={cancelTimer}
                    color="gray"
                    leftSection={<IconX size={20} />}
                    size="md"
                    disabled={isSubmitting}
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
