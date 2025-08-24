"use client";

import { Box, Stack, Text } from "@mantine/core";
import { useMemo } from "react";
import useSettingsStore from "@/stores/settingsStore";

interface TimeColumnProps {
  hourHeight: number;
  hourMultiplier: number;
}

export function TimeColumn({ hourHeight, hourMultiplier }: TimeColumnProps) {
  // Berechne die Anzahl der Zeiteinheiten pro Stunde basierend auf dem Multiplier
  const timeUnitsPerHour = hourMultiplier;

  // Locale aus den Settings lesen
  const locale = useSettingsStore((state) => state.locale);

  // Formatter, der sich an der aktuellen Locale orientiert
  const timeFormatter = useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [locale]);

  // Berechne die Gesamtanzahl der Zeiteinheiten für 24 Stunden
  const totalTimeUnits = 24 * timeUnitsPerHour;

  // Berechne die Höhe pro Zeiteinheit
  const timeUnitHeight = hourHeight;

  // Funktion zum Formatieren der Zeit basierend auf Locale
  const formatTime = (timeUnitIndex: number) => {
    const totalMinutes = (timeUnitIndex * 60) / timeUnitsPerHour;
    const normalizedTotalMinutes =
      ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
    const hours = Math.floor(normalizedTotalMinutes / 60);
    const minutes = Math.floor(normalizedTotalMinutes % 60);

    const date = new Date(1970, 0, 1, hours, minutes, 0, 0);
    return timeFormatter.format(date);
  };

  return (
    <Box w={42} style={{ flex: "0 0 auto" }}>
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
                top: i * timeUnitHeight - 12,
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
