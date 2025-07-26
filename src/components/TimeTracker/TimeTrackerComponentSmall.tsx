"use client";

import { TimerState } from "@/stores/timeTrackerStore";

import { Stack, Text, Collapse, Divider, LoadingOverlay } from "@mantine/core";

import StartActionIcon from "./TimeTrackerActionIcons/StartActionIcons";
import PauseActionIcon from "./TimeTrackerActionIcons/PauseActionIcon";
import ResumeActionIcon from "./TimeTrackerActionIcons/ResumeActionIcon";
import StopActionIcon from "./TimeTrackerActionIcons/StopActionIcon";
import CancelActionIcon from "./TimeTrackerActionIcons/CancelActionIcon";
import TimeTrackerActionIcon from "./TimeTrackerActionIcons/TimeTrackerActionIcon";

interface TimeTrackerComponentSmallProps {
  showSmall: boolean;
  state: TimerState;
  activeTime: string;
  pausedTime: string;
  isSubmitting: boolean;
  setShowSmall: (showSmall: boolean) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  submitTimer: () => void;
  cancelTimer: () => void;
  getStatusColor: () => string;
}

export default function TimeTrackerComponentSmall({
  state,
  showSmall,
  activeTime,
  pausedTime,
  isSubmitting,
  setShowSmall,
  startTimer,
  pauseTimer,
  resumeTimer,
  submitTimer,
  cancelTimer,
  getStatusColor,
}: TimeTrackerComponentSmallProps) {
  return (
    <Stack w={50} align="center" justify="center" gap="xs">
      <TimeTrackerActionIcon
        action={() => setShowSmall(!showSmall)}
        label={showSmall ? "hide Timer" : "show Timer"}
        state={state}
        getStatusColor={getStatusColor}
      />
      <Collapse in={showSmall} transitionDuration={400}>
        <Stack gap="xs" align="center" justify="center" pos="relative">
          <LoadingOverlay visible={isSubmitting} overlayProps={{ blur: 2 }} />
          <Divider />
          <Text size="xs" c="dimmed">
            Active
          </Text>
          <Text size="xs" fw={state === "running" ? 700 : 400}>
            {activeTime}
          </Text>
          <Text size="xs" c="dimmed">
            Paused
          </Text>
          <Text size="xs" fw={state === "paused" ? 700 : 400}>
            {pausedTime}
          </Text>
          {state === "stopped" && <StartActionIcon startTimer={startTimer} />}
          {state === "running" && (
            <PauseActionIcon pauseTimer={pauseTimer} disabled={isSubmitting} />
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
            <Stack gap="xs" align="center" justify="center">
              <StopActionIcon stopTimer={submitTimer} disabled={isSubmitting} />
              <CancelActionIcon
                cancelTimer={cancelTimer}
                disabled={isSubmitting}
              />
            </Stack>
          </Collapse>
        </Stack>
      </Collapse>
    </Stack>
  );
}
