"use client";

import { useSettingsStore } from "@/stores/settingsStore";

import { Stack, Switch } from "@mantine/core";

export default function TimeTrackerSettings() {
  const { locale, automaticlyStopOtherTimer, setAutomaticlyStopOtherTimer } =
    useSettingsStore();

  return (
    <Stack>
      <Switch
        label={
          locale === "de-DE"
            ? "Andere Timer automatisch stoppen, wenn ein neuer gestartet wird"
            : "Automaticly stop other timers when starting a new one"
        }
        checked={automaticlyStopOtherTimer}
        onChange={(event) =>
          setAutomaticlyStopOtherTimer(event.currentTarget.checked)
        }
      />
    </Stack>
  );
}
