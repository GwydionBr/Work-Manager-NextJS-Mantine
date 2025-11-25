"use client";

import { useFormatter } from "@/hooks/useFormatter";

import { Stack } from "@mantine/core";
import SettingsRow from "../SettingsRow";
import CalendarTimeSettings from "./CalendarTimeSettings";

export default function CalendarSettings() {
  const { getLocalizedText } = useFormatter();
  return (
    <Stack>
      <SettingsRow
        title={getLocalizedText("Kalenderzeit", "Calendar Time")}
        children={<CalendarTimeSettings />}
      />
    </Stack>
  );
}
