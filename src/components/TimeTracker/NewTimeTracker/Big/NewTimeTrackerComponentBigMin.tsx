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

interface NewTimeTrackerComponentBigMinProps {
  projectTitle: string;
  state: TimerState;
  activeTime: string;
  pausedTime: string;
  roundedActiveTime: string;
  isSubmitting: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  submitTimer: () => void;
  cancelTimer: () => void;
}

export default function NewTimeTrackerComponentBigMin({
  projectTitle,
  state,
  activeTime,
  pausedTime,
  roundedActiveTime,
  isSubmitting,
  startTimer,
  pauseTimer,
  resumeTimer,
  submitTimer,
  cancelTimer,
}: NewTimeTrackerComponentBigMinProps) {
  return (
    <Card shadow="sm" padding="xs" radius="md" withBorder w={270}>
      <LoadingOverlay visible={isSubmitting} overlayProps={{ blur: 2 }} />
      <Text size="xs" c="dimmed" ta="center">
        {projectTitle}
      </Text>
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
