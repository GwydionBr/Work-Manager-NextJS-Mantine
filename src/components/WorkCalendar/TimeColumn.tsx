"use client";

import { Box, Stack, Text } from "@mantine/core";

interface TimeColumnProps {
  hourHeight: number;
  hourMultiplier: number;
}

export function TimeColumn({ hourHeight, hourMultiplier }: TimeColumnProps) {
  // Berechne die Anzahl der Zeiteinheiten pro Stunde basierend auf dem Multiplier
  const timeUnitsPerHour = hourMultiplier;

  // Berechne die Gesamtanzahl der Zeiteinheiten für 24 Stunden
  const totalTimeUnits = 24 * timeUnitsPerHour;

  // Berechne die Höhe pro Zeiteinheit
  const timeUnitHeight = hourHeight;

  // Funktion zum Formatieren der Zeit basierend auf dem Multiplier
  const formatTime = (timeUnitIndex: number) => {
    const totalMinutes = (timeUnitIndex * 60) / timeUnitsPerHour;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);

    if (timeUnitsPerHour === 1) {
      // Nur volle Stunden
      return `${String(hours).padStart(2, "0")}:00`;
    } else if (timeUnitsPerHour === 2) {
      // Halbe Stunden
      return `${String(hours).padStart(2, "0")}:${minutes === 0 ? "00" : "30"}`;
    } else if (timeUnitsPerHour === 4) {
      // Viertelstunden
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    } else if (timeUnitsPerHour === 6) {
      // Jede 10. Minute
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    } else if (timeUnitsPerHour === 12) {
      // Jede 5. Minute
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };

  return (
    <Box w={56} style={{ flex: "0 0 auto" }}>
      <Stack gap="xs">
        <Box
          style={{
            position: "relative",
            height: totalTimeUnits * timeUnitHeight,
          }}
        >
          {Array.from({ length: totalTimeUnits + 1 }, (_, i) => (
            <Text
              key={i}
              size="xs"
              c="light-dark(var(--mantine-color-gray-9), var(--mantine-color-gray-0))"
              style={{
                position: "absolute",
                top: i * timeUnitHeight - 4,
                left: 2,
                width: "100%",
                textAlign: "right",
                paddingRight: 8,
              }}
            >
              {formatTime(i)}
            </Text>
          ))}
        </Box>
      </Stack>
    </Box>
  );
}
