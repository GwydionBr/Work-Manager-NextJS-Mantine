"use client";

import { useSettingsStore } from "@/stores/settingsStore";
import { useFormatter } from "@/hooks/useFormatter";

import { Stack, Switch } from "@mantine/core";

export default function TimeTrackerSettings() {
  const { automaticlyStopOtherTimer, setAutomaticlyStopOtherTimer } =
    useSettingsStore();
  const { getLocalizedText } = useFormatter();

  return (
    <Stack>
      <Switch
        label={getLocalizedText(
          "Andere Timer automatisch stoppen, wenn ein neuer gestartet wird",
          "Automaticly stop other timers when starting a new one"
        )}
        checked={automaticlyStopOtherTimer}
        onChange={(event) =>
          setAutomaticlyStopOtherTimer(event.currentTarget.checked)
        }
      />
    </Stack>
  );
}
