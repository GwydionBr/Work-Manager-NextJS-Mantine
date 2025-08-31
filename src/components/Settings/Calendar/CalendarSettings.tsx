"use client";

import { useSettingsStore } from "@/stores/settingsStore";

import { Stack } from "@mantine/core";
import SettingsRow from "../SettingsRow";
import CalendarTimeSettings from "./CalendarTimeSettings";

export default function CalendarSettings() {
  const { locale } = useSettingsStore();
  return (
    <Stack>
      <SettingsRow
        title={locale === "de-DE" ? "Kalenderzeit" : "Calendar Time"}
        children={<CalendarTimeSettings />}
      />
    </Stack>
  );
}
