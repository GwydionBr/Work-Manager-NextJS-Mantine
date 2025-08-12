"use client";

import { useSettingsStore } from "@/stores/settingsStore";

import { Stack, Switch } from "@mantine/core";

export default function TimeTrackerSettings() {
  const { automaticlyStopOtherTimer, setAutomaticlyStopOtherTimer } =
    useSettingsStore();

  return (
    <Stack>
      <Switch
        label="Automaticly stop other timers when starting a new one"
        checked={automaticlyStopOtherTimer}
        onChange={(event) =>
          setAutomaticlyStopOtherTimer(event.currentTarget.checked)
        }
      />
    </Stack>
  );
}
