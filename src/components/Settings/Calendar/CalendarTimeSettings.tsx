"use client";

import { useSettingsStore } from "@/stores/settingsStore";

import { Group, Switch } from "@mantine/core";

export default function CalendarTimeSettings() {
  const { locale, showCalendarTime, setShowCalendarTime } = useSettingsStore();

  return (
    <Group>
      {" "}
      <Switch
        label={
          locale === "de-DE"
            ? "Zeit unter der Maushover in Kalender anzeigen"
            : "Show hovered time under mouse in calendar"
        }
        checked={showCalendarTime}
        onChange={(event) =>
          setShowCalendarTime(event.currentTarget.checked)
        }
      />
    </Group>
  );
}
