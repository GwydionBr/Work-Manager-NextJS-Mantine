"use client";

import { useState } from "react";
import { useTimeTracker } from "@/stores/timeTrackerStore";

import {
  Stack,
  Text,
  Modal,
  Box,
  Group,
  Button,
  Divider,
  Alert,
  TextInput,
  Select,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import MoreActionIcon from "../UI/ActionIcons/MoreActionIcon";
import PlusActionIcon from "../UI/ActionIcons/PlusActionIcon";
import MinusActionIcon from "../UI/ActionIcons/MinusActionIcon";

export default function ModifyTimeTrackerModal() {
  const [opened, setOpened] = useState(false);
  const {
    modifyActiveSeconds,
    modifyPausedSeconds,
    activeSeconds,
    pausedSeconds,
  } = useTimeTracker();
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
        setErrorMessage("Die aktive Zeit kann nicht unter 0 fallen.");
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
        setErrorMessage("Die pausierte Zeit kann nicht unter 0 fallen.");
        return;
      }

      modifyPausedSeconds(seconds);
      setPausedTimeInput("");
      setErrorMessage("");
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Box>
      <MoreActionIcon
        onClick={() => setOpened(true)}
        aria-label="Modify Time Tracker"
        tooltipLabel="Modify Time Tracker"
      />
      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false);
          setActiveTimeInput("");
          setPausedTimeInput("");
          setErrorMessage("");
        }}
        title="Zeit anpassen"
        size="md"
      >
        <Stack gap="md">
          {/* Aktuelle Zeiten anzeigen */}
          <Box>
            <Text size="sm" c="dimmed" mb="xs">
              Aktuelle Zeiten:
            </Text>
            <Group gap="md">
              <Box>
                <Text size="xs" c="dimmed">
                  Aktiv:
                </Text>
                <Text fw={500}>{formatTime(activeSeconds)}</Text>
              </Box>
              <Box>
                <Text size="xs" c="dimmed">
                  Pausiert:
                </Text>
                <Text fw={500}>{formatTime(pausedSeconds)}</Text>
              </Box>
            </Group>
          </Box>

          <Divider />

          {/* Schnelle Anpassungen */}
          <Box>
            <Text size="sm" fw={500} mb="xs">
              Schnelle Anpassungen
            </Text>
            <Group gap="xs">
              <MinusActionIcon onClick={() => handleActiveTimeChange(-300)} />
              <Text size="xs">-5 Min</Text>
              <MinusActionIcon onClick={() => handleActiveTimeChange(-60)} />
              <Text size="xs">-1 Min</Text>
              <Text size="sm">Aktive Zeit</Text>
              <PlusActionIcon onClick={() => handleActiveTimeChange(60)} />
              <Text size="xs">+1 Min</Text>
              <PlusActionIcon onClick={() => handleActiveTimeChange(300)} />
              <Text size="xs">+5 Min</Text>
            </Group>
            <Group gap="xs" mt="xs">
              <MinusActionIcon onClick={() => handlePausedTimeChange(-300)} />
              <Text size="xs">-5 Min</Text>
              <MinusActionIcon onClick={() => handlePausedTimeChange(-60)} />
              <Text size="xs">-1 Min</Text>
              <Text size="sm">Pausierte Zeit</Text>
              <PlusActionIcon onClick={() => handlePausedTimeChange(60)} />
              <Text size="xs">+1 Min</Text>
              <PlusActionIcon onClick={() => handlePausedTimeChange(300)} />
              <Text size="xs">+5 Min</Text>
            </Group>
          </Box>

          <Divider />

          {/* Benutzerdefinierte Anpassungen */}
          <Box>
            <Text size="sm" fw={500} mb="xs">
              Benutzerdefinierte Anpassungen
            </Text>

            <Select
              label="Zeiteinheit"
              value={timeUnit}
              onChange={(value) =>
                setTimeUnit(value as "seconds" | "minutes" | "hours")
              }
              data={[
                { value: "seconds", label: "Sekunden" },
                { value: "minutes", label: "Minuten" },
                { value: "hours", label: "Stunden" },
              ]}
              mb="xs"
            />

            <Group gap="xs" align="end">
              <TextInput
                label="Aktive Zeit ändern"
                placeholder={`Wert in ${timeUnit === "seconds" ? "Sekunden" : timeUnit === "minutes" ? "Minuten" : "Stunden"}`}
                value={activeTimeInput}
                onChange={(event) =>
                  setActiveTimeInput(event.currentTarget.value)
                }
                style={{ flex: 1 }}
              />
              <Button
                size="sm"
                onClick={handleCustomActiveTimeChange}
                disabled={!activeTimeInput}
              >
                Anwenden
              </Button>
            </Group>

            <Group gap="xs" align="end" mt="xs">
              <TextInput
                label="Pausierte Zeit ändern"
                placeholder={`Wert in ${timeUnit === "seconds" ? "Sekunden" : timeUnit === "minutes" ? "Minuten" : "Stunden"}`}
                value={pausedTimeInput}
                onChange={(event) =>
                  setPausedTimeInput(event.currentTarget.value)
                }
                style={{ flex: 1 }}
              />
              <Button
                size="sm"
                onClick={handleCustomPausedTimeChange}
                disabled={!pausedTimeInput}
              >
                Anwenden
              </Button>
            </Group>

            {errorMessage && (
              <Alert icon={<IconAlertCircle size="1rem" />} color="red" mt="xs">
                {errorMessage}
              </Alert>
            )}
          </Box>

          <Text size="xs" c="dimmed" ta="center">
            Hinweis: Negative Werte reduzieren die Zeit. Die Zeit kann nicht
            unter 0 fallen.
          </Text>
        </Stack>
      </Modal>
    </Box>
  );
}
