"use client";

import {
  Card,
  Collapse,
  Group,
  LoadingOverlay,
  Stack,
  Text,
} from "@mantine/core";
import { TimerState } from "@/stores/timeTrackerStore";
import StartActionIcon from "@/components/TimeTracker/TimeTrackerActionIcons/StartActionIcons";
import PauseActionIcon from "@/components/TimeTracker/TimeTrackerActionIcons/PauseActionIcon";
import ResumeActionIcon from "@/components/TimeTracker/TimeTrackerActionIcons/ResumeActionIcon";
import StopActionIcon from "@/components/TimeTracker/TimeTrackerActionIcons/StopActionIcon";
import CancelActionIcon from "@/components/TimeTracker/TimeTrackerActionIcons/CancelActionIcon";
import XActionIcon from "@/components/UI/ActionIcons/XActionIcon";
import ModifyTimeTrackerModal from "@/components/TimeTracker/ModifyTimeTracker/ModifyTimeTrackerModal";
import TimeTrackerInfoHoverCard from "@/components/TimeTracker/TimeTrackerInfoHoverCard";
import {
  Currency,
  RoundingAmount,
  RoundingDirection,
} from "@/types/settings.types";

interface NewTimeTrackerComponentBigMinProps {
  projectTitle: string;
  state: TimerState;
  activeSeconds: number;
  activeTime: string;
  pausedTime: string;
  roundedActiveTime: string;
  isSubmitting: boolean;
  roundingMode: RoundingDirection;
  roundingInterval: number;
  currency: Currency;
  salary: number;
  hourlyPayment: boolean;
  storedActiveSeconds: number;
  storedPausedSeconds: number;
  modifyActiveSeconds: (delta: number) => void;
  modifyPausedSeconds: (delta: number) => void;
  setRoundingAmount: (
    roundingAmount: RoundingAmount,
    roundingMode: RoundingDirection,
    customRoundingAmount: number
  ) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  submitTimer: () => void;
  cancelTimer: () => void;
  removeTimer: () => void;
}

export default function NewTimeTrackerComponentBigMin({
  projectTitle,
  state,
  activeSeconds,
  activeTime,
  pausedTime,
  roundedActiveTime,
  isSubmitting,
  storedActiveSeconds,
  storedPausedSeconds,
  roundingMode,
  roundingInterval,
  currency,
  salary,
  hourlyPayment,
  modifyActiveSeconds,
  modifyPausedSeconds,
  setRoundingAmount,
  startTimer,
  pauseTimer,
  resumeTimer,
  submitTimer,
  cancelTimer,
  removeTimer,
}: NewTimeTrackerComponentBigMinProps) {
  return (
    <Card shadow="sm" padding="xs" radius="md" withBorder w={270}>
      <LoadingOverlay visible={isSubmitting} overlayProps={{ blur: 2 }} />
      <Group justify="center" align="center">
        <ModifyTimeTrackerModal
          activeTime={activeTime}
          pausedTime={pausedTime}
          state={state}
          roundingMode={roundingMode}
          activeSeconds={activeSeconds}
          storedActiveSeconds={storedActiveSeconds}
          storedPausedSeconds={storedPausedSeconds}
          roundingInterval={roundingInterval}
          modifyActiveSeconds={modifyActiveSeconds}
          modifyPausedSeconds={modifyPausedSeconds}
          setRoundingAmount={setRoundingAmount}
        />
        <TimeTrackerInfoHoverCard
          currency={currency}
          roundingMode={roundingMode}
          roundingInterval={roundingInterval}
          projectTitle={projectTitle}
          salary={salary}
          hourlyPayment={hourlyPayment}
        />
        <Text size="xs" c="dimmed" ta="center">
          {projectTitle}
        </Text>
        <XActionIcon onClick={removeTimer} size="xs" />
      </Group>
      <Group align="center" justify="center" gap="xs">
        <Card
          shadow="sm"
          padding="xs"
          radius="md"
          withBorder
          style={{
            borderColor:
              state === TimerState.Running ? "var(--mantine-color-blue-6)" : "",
          }}
        >
          <Stack gap="xs">
            <Text size="xs" c="dimmed">
              Active
            </Text>
            <Text size="xs" fw={state === "running" ? 700 : 400}>
              {activeTime}
            </Text>
            <Text size="xs" c="dimmed">
              {roundedActiveTime}
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
          <PauseActionIcon pauseTimer={pauseTimer} disabled={isSubmitting} />
        )}
        {state === "paused" && (
          <ResumeActionIcon resumeTimer={resumeTimer} disabled={isSubmitting} />
        )}
        <Collapse
          in={state === "running" || state === "paused"}
          transitionDuration={400}
        >
          <Group gap="xs" align="center" justify="center">
            <StopActionIcon stopTimer={submitTimer} disabled={isSubmitting} />
            <CancelActionIcon
              cancelTimer={cancelTimer}
              disabled={isSubmitting}
            />
          </Group>
        </Collapse>
      </Group>
    </Card>
  );
}
