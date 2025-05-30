"use client";

import { TimerState } from "@/stores/timeTrackerStore";

import {
  ActionIcon,
  Stack,
  Text,
  Collapse,
  Divider,
  Indicator,
  HoverCard,
} from "@mantine/core";
import {
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerStop,
  IconX,
  IconStopwatch,
} from "@tabler/icons-react";

interface TimeTrackerComponentSmallProps {
  showSmall: boolean;
  state: TimerState;
  activeTime: string;
  pausedTime: string;
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
      <HoverCard position="top" openDelay={500} withArrow>
        <HoverCard.Target>
          <Indicator color="red" size={10} disabled={state === "stopped"}>
            <ActionIcon
              onClick={() => setShowSmall(!showSmall)}
              size="md"
              color={getStatusColor()}
            >
              <IconStopwatch />
            </ActionIcon>
          </Indicator>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Text size="xs" fw={700}>
            {showSmall ? "hide Timer" : "show Timer"}
          </Text>
        </HoverCard.Dropdown>
      </HoverCard>
      <Collapse in={showSmall} transitionDuration={400}>
        <Stack gap="xs" align="center" justify="center">
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
          {state === "stopped" && (
            <ActionIcon onClick={startTimer} size="md" color="green">
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
          <Collapse in={state === "running"} transitionDuration={400}>
            <Stack gap="xs" align="center" justify="center">
              <ActionIcon onClick={submitTimer} size="md" color="red">
                <IconPlayerStop />
              </ActionIcon>
              <ActionIcon onClick={cancelTimer} size="md" color="gray">
                <IconX />
              </ActionIcon>
            </Stack>
          </Collapse>
        </Stack>
      </Collapse>
    </Stack>
  );
}
