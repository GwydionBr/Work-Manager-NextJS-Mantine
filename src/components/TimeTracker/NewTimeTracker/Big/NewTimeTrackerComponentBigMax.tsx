"use client";

import {
  Badge,
  Card,
  Group,
  LoadingOverlay,
  Stack,
  Text,
  Button,
  Paper,
  Collapse,
} from "@mantine/core";
import { TimerState } from "@/stores/timeTrackerStore";
import TimeTrackerRow from "../../TimeTrackerRow";
import {
  IconCurrencyEuro,
  IconCurrencyDollar,
  IconPlayerPlay,
  IconPlayerPause,
  IconPlayerStop,
  IconX,
} from "@tabler/icons-react";
import {
  Currency,
  RoundingAmount,
  RoundingDirection,
} from "@/types/settings.types";
import { getStatusColor } from "@/utils/workHelperFunctions";
import ModifyTimeTrackerModal from "../../ModifyTimeTracker/ModifyTimeTrackerModal";
import TimeTrackerInfoHoverCard from "../../TimeTrackerInfoHoverCard";

interface NewTimeTrackerComponentBigMaxProps {
  projectTitle: string;
  state: TimerState;
  activeSeconds: number;
  activeTime: string;
  pausedTime: string;
  roundedActiveTime: string;
  isSubmitting: boolean;
  moneyEarned: string;
  storedActiveSeconds: number;
  storedPausedSeconds: number;
  roundingMode: RoundingDirection;
  roundingInterval: number;
  currency: Currency;
  salary: number;
  hourlyPayment: boolean;
  errorMessage: string | null;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  submitTimer: () => void;
  cancelTimer: () => void;
  setRoundingAmount: (
    roundingAmount: RoundingAmount,
    roundingMode: RoundingDirection,
    customRoundingAmount: number
  ) => void;
  modifyActiveSeconds: (delta: number) => void;
  modifyPausedSeconds: (delta: number) => void;
}

export default function NewTimeTrackerComponentBigMax({
  projectTitle,
  state,
  activeSeconds,
  activeTime,
  pausedTime,
  roundedActiveTime,
  isSubmitting,
  moneyEarned,
  storedActiveSeconds,
  storedPausedSeconds,
  roundingMode,
  roundingInterval,
  currency,
  salary,
  hourlyPayment,
  errorMessage,
  startTimer,
  pauseTimer,
  resumeTimer,
  submitTimer,
  cancelTimer,
  modifyActiveSeconds,
  modifyPausedSeconds,
  setRoundingAmount,
}: NewTimeTrackerComponentBigMaxProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder w={270}>
      <LoadingOverlay visible={isSubmitting} overlayProps={{ blur: 2 }} />
      <Stack gap="md" align="center">
        {/* State Badge */}
        <Group justify="space-between" align="center" w="100%">
          <ModifyTimeTrackerModal
            modifyActiveSeconds={modifyActiveSeconds}
            modifyPausedSeconds={modifyPausedSeconds}
            activeTime={activeTime}
            pausedTime={pausedTime}
            state={state}
            activeSeconds={activeSeconds}
            storedActiveSeconds={storedActiveSeconds}
            storedPausedSeconds={storedPausedSeconds}
            roundingMode={roundingMode}
            roundingInterval={roundingInterval}
            setRoundingAmount={setRoundingAmount}
          />
          <Badge size="lg" color={getStatusColor(state)}>
            {state}
          </Badge>
          <TimeTrackerInfoHoverCard
            currency={currency}
            roundingMode={roundingMode}
            roundingInterval={roundingInterval}
            projectTitle={projectTitle}
            salary={salary}
            hourlyPayment={hourlyPayment}
          />
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
              <IconPlayerPlay size={20} color="var(--mantine-color-blue-6)" />
            }
            value={activeTime}
            secondValue={roundedActiveTime}
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

          <Collapse in={state !== "stopped"} transitionDuration={400} w="60%">
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
  );
}
