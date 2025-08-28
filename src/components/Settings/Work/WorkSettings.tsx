"use client";

import { useSettingsStore } from "@/stores/settingsStore";

import { Stack } from "@mantine/core";
import SettingsRow from "../SettingsRow";
import SelectTimerRounding from "./RoundingSettings";
import WorkDefaultSettings from "./WorkDefaultSettings";
import TimeTrackerSettings from "./TimeTrackerSettings";

export default function WorkSettings() {
  const { locale } = useSettingsStore();
  return (
    <Stack>
      <SettingsRow
        title={locale === "de-DE" ? "Zeiterfassung" : "Time Tracker"}
        children={<TimeTrackerSettings />}
      />
      <SettingsRow
        title={
          locale === "de-DE"
            ? "Rundung der Zeiterfassung"
            : "Time Tracker Rounding"
        }
        children={<SelectTimerRounding />}
      />
      <SettingsRow
        title={
          locale === "de-DE"
            ? "Arbeitsmanager Einstellungen"
            : "Work Manager Settings"
        }
        children={<WorkDefaultSettings />}
      />
    </Stack>
  );
}
