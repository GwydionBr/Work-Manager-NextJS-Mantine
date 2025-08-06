"use client";

import { useState } from "react";
import { TimerState, useTimeTracker } from "@/stores/timeTrackerStore";

import {
  Stack,
  Text,
  Box,
  Group,
  Button,
  Divider,
  Alert,
  TextInput,
  Select,
  Card,
  Title,
  Paper,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconClock,
  IconPlayerPlay,
  IconPlayerPause,
  IconPlus,
  IconMinus,
  IconSettings,
} from "@tabler/icons-react";
import TimeTrackerRow from "../TimeTrackerRow";

interface ModifyTimeProps {
  modifyActiveSeconds: (delta: number) => void;
  modifyPausedSeconds: (delta: number) => void;
  activeTime: string;
  pausedTime: string;
  state: TimerState;
}

export default function ModifyTime({
  modifyActiveSeconds,
  modifyPausedSeconds,
  activeTime,
  pausedTime,
  state,
}: ModifyTimeProps) {
  const [activeTimeInput, setActiveTimeInput] = useState("");
  const [pausedTimeInput, setPausedTimeInput] = useState("");
  const [timeUnit, setTimeUnit] = useState<"seconds" | "minutes" | "hours">(
    "minutes"
  );
  const [errorMessage, setErrorMessage] = useState("");

  const handleActiveTimeChange = (change: number) => {
    modifyActiveSeconds(change);
  };

  const handlePausedTimeChange = (change: number) => {
    modifyPausedSeconds(change);
  };

  const parseTimeInput = (
    input: string,
    unit: "seconds" | "minutes" | "hours"
  ): number => {
    const value = parseFloat(input);
    if (isNaN(value)) return 0;

    switch (unit) {
      case "seconds":
        return value;
      case "minutes":
        return value * 60;
      case "hours":
        return value * 3600;
      default:
        return value;
    }
  };

  const handleCustomActiveTimeChange = () => {
    const seconds = parseTimeInput(activeTimeInput, timeUnit);
    if (seconds !== 0) {
      // Berechne die neue aktive Zeit basierend auf den aktuellen storedActiveSeconds
      const { storedActiveSeconds } = useTimeTracker.getState();
      const newStoredActiveSeconds = storedActiveSeconds + seconds;

      if (newStoredActiveSeconds < 0) {
        setErrorMessage("Active time cannot fall below 0.");
        return;
      }

      modifyActiveSeconds(seconds);
      setActiveTimeInput("");
      setErrorMessage("");
    }
  };

  const handleCustomPausedTimeChange = () => {
    const seconds = parseTimeInput(pausedTimeInput, timeUnit);
    if (seconds !== 0) {
      // Berechne die neue pausierte Zeit basierend auf den aktuellen storedPausedSeconds
      const { storedPausedSeconds } = useTimeTracker.getState();
      const newStoredPausedSeconds = storedPausedSeconds + seconds;

      if (newStoredPausedSeconds < 0) {
        setErrorMessage("Paused time cannot fall below 0.");
        return;
      }

      modifyPausedSeconds(seconds);
      setPausedTimeInput("");
      setErrorMessage("");
    }
  };
  return (
    <Stack gap="lg">
      {/* Aktuelle Zeiten anzeigen */}
      <Card withBorder shadow="sm" radius="md" p="lg">
        <Group justify="space-between" mb="md">
          <Title order={4} c="dimmed">
            <IconClock size={18} style={{ marginRight: "8px" }} />
            Current Times
          </Title>
        </Group>

        <Group gap="xl" justify="center">
          <TimeTrackerRow
            value={activeTime}
            state={state}
            activationState={TimerState.Running}
            color="var(--mantine-color-blue-6)"
            icon={
              <IconPlayerPlay size={16} color="var(--mantine-color-blue-6)" />
            }
          />

          <TimeTrackerRow
            value={pausedTime}
            state={state}
            activationState={TimerState.Paused}
            color="var(--mantine-color-orange-6)"
            icon={
              <IconPlayerPause
                size={16}
                color="var(--mantine-color-orange-6)"
              />
            }
          />
        </Group>
      </Card>

      {/* Schnelle Anpassungen */}
      <Card withBorder shadow="sm" radius="md" p="lg">
        <Title order={4} mb="md" c="dimmed">
          <IconClock size={18} style={{ marginRight: "8px" }} />
          Quick Adjustments
        </Title>

        <Stack gap="md">
          {/* Aktive Zeit */}
          <Box>
            <Group mb="xs" gap="xs">
              <IconPlayerPlay size={16} color="var(--mantine-color-blue-6)" />
              <Text size="sm" fw={600} c="blue.7">
                Active Time
              </Text>
            </Group>
            <Group gap="xs" justify="center">
              <Button.Group>
                <Button
                  variant="light"
                  color="red"
                  size="sm"
                  leftSection={<IconMinus size={14} />}
                  onClick={() => handleActiveTimeChange(-300)}
                >
                  5 Min
                </Button>
                <Button
                  variant="light"
                  color="red"
                  size="sm"
                  leftSection={<IconMinus size={14} />}
                  onClick={() => handleActiveTimeChange(-60)}
                >
                  1 Min
                </Button>
                <Button
                  variant="light"
                  color="green"
                  size="sm"
                  leftSection={<IconPlus size={14} />}
                  onClick={() => handleActiveTimeChange(60)}
                >
                  1 Min
                </Button>
                <Button
                  variant="light"
                  color="green"
                  size="sm"
                  leftSection={<IconPlus size={14} />}
                  onClick={() => handleActiveTimeChange(300)}
                >
                  5 Min
                </Button>
              </Button.Group>
            </Group>
          </Box>

          <Divider />

          {/* Pausierte Zeit */}
          <Box>
            <Group mb="xs" gap="xs">
              <IconPlayerPause
                size={16}
                color="var(--mantine-color-orange-6)"
              />
              <Text size="sm" fw={600} c="orange.7">
                Paused Time
              </Text>
            </Group>
            <Group gap="xs" justify="center">
              <Button.Group>
                <Button
                  variant="light"
                  color="red"
                  size="sm"
                  leftSection={<IconMinus size={14} />}
                  onClick={() => handlePausedTimeChange(-300)}
                >
                  5 Min
                </Button>
                <Button
                  variant="light"
                  color="red"
                  size="sm"
                  leftSection={<IconMinus size={14} />}
                  onClick={() => handlePausedTimeChange(-60)}
                >
                  1 Min
                </Button>
                <Button
                  variant="light"
                  color="green"
                  size="sm"
                  leftSection={<IconPlus size={14} />}
                  onClick={() => handlePausedTimeChange(60)}
                >
                  1 Min
                </Button>
                <Button
                  variant="light"
                  color="green"
                  size="sm"
                  leftSection={<IconPlus size={14} />}
                  onClick={() => handlePausedTimeChange(300)}
                >
                  5 Min
                </Button>
              </Button.Group>
            </Group>
          </Box>
        </Stack>
      </Card>

      {/* Benutzerdefinierte Anpassungen */}
      <Card withBorder shadow="sm" radius="md" p="lg">
        <Title order={4} mb="md" c="dimmed">
          <IconSettings size={18} style={{ marginRight: "8px" }} />
          Custom Adjustments
        </Title>

        <Stack gap="md">
          <Select
            label="Time Unit"
            value={timeUnit}
            onChange={(value) =>
              setTimeUnit(value as "seconds" | "minutes" | "hours")
            }
            data={[
              { value: "seconds", label: "Seconds" },
              { value: "minutes", label: "Minutes" },
              { value: "hours", label: "Hours" },
            ]}
            styles={{
              label: {
                fontWeight: 600,
                marginBottom: "0.5rem",
              },
            }}
          />

          <Box>
            <Group gap="xs" align="end">
              <TextInput
                label="Change Active Time"
                placeholder={`Value in ${timeUnit === "seconds" ? "seconds" : timeUnit === "minutes" ? "minutes" : "hours"}`}
                value={activeTimeInput}
                onChange={(event) =>
                  setActiveTimeInput(event.currentTarget.value)
                }
                style={{ flex: 1 }}
                leftSection={
                  <IconPlayerPlay
                    size={16}
                    color="var(--mantine-color-blue-6)"
                  />
                }
                styles={{
                  label: {
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                  },
                }}
              />
              <Button
                variant="filled"
                color="blue"
                size="md"
                onClick={handleCustomActiveTimeChange}
                disabled={!activeTimeInput}
                leftSection={<IconPlus size={16} />}
              >
                Apply
              </Button>
            </Group>
          </Box>

          <Box>
            <Group gap="xs" align="end">
              <TextInput
                label="Change Paused Time"
                placeholder={`Value in ${timeUnit === "seconds" ? "seconds" : timeUnit === "minutes" ? "minutes" : "hours"}`}
                value={pausedTimeInput}
                onChange={(event) =>
                  setPausedTimeInput(event.currentTarget.value)
                }
                style={{ flex: 1 }}
                leftSection={
                  <IconPlayerPause
                    size={16}
                    color="var(--mantine-color-orange-6)"
                  />
                }
                styles={{
                  label: {
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                  },
                }}
              />
              <Button
                variant="filled"
                color="orange"
                size="md"
                onClick={handleCustomPausedTimeChange}
                disabled={!pausedTimeInput}
                leftSection={<IconPlus size={16} />}
              >
                Apply
              </Button>
            </Group>
          </Box>

          {errorMessage && (
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              color="red"
              variant="light"
              radius="md"
            >
              {errorMessage}
            </Alert>
          )}
        </Stack>
      </Card>

      <Paper
        p="md"
        radius="md"
        bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))"
        withBorder
      >
        <Text size="xs" c="dimmed" ta="center" style={{ lineHeight: 1.4 }}>
          <IconAlertCircle
            size={12}
            style={{ marginRight: "4px", verticalAlign: "middle" }}
          />
          Note: Negative values reduce time. Time cannot fall below 0.
        </Text>
      </Paper>
    </Stack>
  );
}
