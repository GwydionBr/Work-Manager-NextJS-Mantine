"use client";

import { useSettingsStore } from "@/stores/settingsStore";
import { useCalendarStore } from "@/stores/calendarStore";

import { Group, ActionIcon, Text } from "@mantine/core";
import { IconArrowsSort, IconPlus } from "@tabler/icons-react";

import { VisibleProject } from "@/types/workCalendar.types";
import DelayedTooltip from "@/components/UI/DelayedTooltip";
import CalendarLegendButton from "./CalendarLegendButton";
import PlusActionIcon from "@/components/UI/ActionIcons/PlusActionIcon";

interface CalendarLegendProps {
  visibleProjects: VisibleProject[];
  handleScrollToNow: () => void;
}

export default function CalendarLegend({
  visibleProjects,
  handleScrollToNow,
}: CalendarLegendProps) {
  const { locale } = useSettingsStore();
  const { addingMode, setAddingMode } = useCalendarStore();

  return (
    <Group
      p={5}
      wrap="nowrap"
      justify="space-between"
      w="100%"
      style={{
        position: "sticky",
        bottom: 0,
        zIndex: 100,
        background: "var(--mantine-color-body)",
        borderTop:
          "1px solid light-dark(var(--mantine-color-gray-8), var(--mantine-color-dark-1))",
      }}
    >
      <PlusActionIcon
        tooltipLabel={
          addingMode
            ? locale === "de-DE"
              ? "Eintragungsmodus deaktivieren (Escape)"
              : "Disable entry mode (Escape)"
            : locale === "de-DE"
              ? "Eintragungsmodus aktivieren (Enter)"
              : "Enable entry mode (Enter)"
        }
        variant={addingMode ? "filled" : "light"}
        onClick={() => setAddingMode(!addingMode)}
      />
      {visibleProjects.length > 0 ? (
        <Group justify="center" wrap="wrap" gap="xs" w="100%">
          {visibleProjects.map((p) => (
            <CalendarLegendButton key={p.id} p={p} />
          ))}
        </Group>
      ) : (
        <Text size="sm" c="dimmed">
          {locale === "de-DE" ? "Keine Einträge gefunden" : "No entries found"}
        </Text>
      )}
      <DelayedTooltip
        label={
          locale === "de-DE"
            ? "Springe zur aktuellen Zeit"
            : "Scroll to current time"
        }
      >
        <ActionIcon
          variant="light"
          size="lg"
          radius="md"
          onClick={handleScrollToNow}
        >
          <IconArrowsSort color="var(--mantine-color-teal-text)" />
        </ActionIcon>
      </DelayedTooltip>
    </Group>
  );
}
