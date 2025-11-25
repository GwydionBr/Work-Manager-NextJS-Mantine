"use client";

import { useSettingsStore } from "@/stores/settingsStore";
import { useFormatter } from "@/hooks/useFormatter";

import { Group, Switch } from "@mantine/core";

export default function CalendarTimeSettings() {
  const { showCalendarTime, setShowCalendarTime } = useSettingsStore();
  const { getLocalizedText } = useFormatter();
  return (
    <Group>
      {" "}
      <Switch
        label={getLocalizedText(
          "Zeit unter der Maushover in Kalender anzeigen",
          "Show hovered time under mouse in calendar"
        )}
        checked={showCalendarTime}
        onChange={(event) => setShowCalendarTime(event.currentTarget.checked)}
      />
    </Group>
  );
}
