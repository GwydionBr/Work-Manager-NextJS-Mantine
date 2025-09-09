"use client";

import { useSettingsStore } from "@/stores/settingsStore";
import { useCalendarStore } from "@/stores/calendarStore";

import { Group, ActionIcon, Text, Kbd, Stack } from "@mantine/core";
import { IconArrowsSort, IconMinus, IconPlus } from "@tabler/icons-react";
import DelayedTooltip from "@/components/UI/DelayedTooltip";
import CalendarLegendButton from "./CalendarLegendButton";

import { VisibleProject } from "@/types/workCalendar.types";

const zoomLabels = ["1 h", "30 min", "15 min", "10 min", "5 min"];


interface CalendarLegendProps {
  visibleProjects: VisibleProject[];
  handleScrollToNow: () => void;
  handleZoomChange: (oldIndex: number, newIndex: number) => void;
}

export default function CalendarLegend({
  visibleProjects,
  handleScrollToNow,
  handleZoomChange,
}: CalendarLegendProps) {
  const { locale } = useSettingsStore();
  const {  zoomIndex, changeZoomIndex } = useCalendarStore();

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
      <ActionIcon.Group>
        <ActionIcon
          variant="light"
          color="red"
          size="lg"
          radius="md"
          onClick={() => {
            const currentZoomIndex = zoomIndex;
            changeZoomIndex(-1);
            handleZoomChange(currentZoomIndex, currentZoomIndex - 1);
          }}
          disabled={zoomIndex === 0}
        >
          <IconMinus color="var(--mantine-color-red-text)" />
        </ActionIcon>
        <ActionIcon.GroupSection
          variant="default"
          size="lg"
          bg="var(--mantine-color-body)"
          miw={85}
          ta="center"
          fw={600}
        >
          {zoomLabels[zoomIndex]}
        </ActionIcon.GroupSection>
        <ActionIcon
          variant="light"
          size="lg"
          radius="md"
          onClick={() => {
            const currentZoomIndex = zoomIndex;
            changeZoomIndex(1);
            handleZoomChange(currentZoomIndex, currentZoomIndex + 1);
          }}
          disabled={zoomIndex === 4}
        >
          <IconPlus color="var(--mantine-color-teal-text)" />
        </ActionIcon>
      </ActionIcon.Group>
      
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
