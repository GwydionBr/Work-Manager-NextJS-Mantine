"use client";

import { useState } from "react";
import { useWorkStore } from "@/stores/workManagerStore";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  Group,
  Popover,
  Button,
  Box,
  ColorPicker,
  ActionIcon,
  DEFAULT_THEME,
} from "@mantine/core";
import { IconArrowsSort } from "@tabler/icons-react";

import { VisibleProject } from "@/types/workCalendar.types";
import DelayedTooltip from "@/components/UI/DelayedTooltip";

interface CalendarLegendProps {
  visibleProjects: VisibleProject[];
  handleScrollToNow: () => void;
}

export default function CalendarLegend({
  visibleProjects,
  handleScrollToNow,
}: CalendarLegendProps) {
  const { locale } = useSettingsStore();
  const { updateProject } = useWorkStore();
  const [selectedColor, setSelectedColor] = useState<string>("#000000");

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
      <Group justify="center" wrap="wrap" gap="xs" w="100%">
        {visibleProjects.map((p) => (
          <Popover
            key={p.id}
            onOpen={() => {
              setSelectedColor(p.color);
            }}
            onClose={() => {
              updateProject({
                id: p.id,
                color: selectedColor,
              });
            }}
          >
            <Popover.Target>
              <Button
                c="light-dark(var(--mantine-color-black), var(--mantine-color-white))"
                variant="subtle"
                size="xs"
                leftSection={
                  <Box
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 10,
                      background: p.color,
                      boxShadow: `0 0 0 1px ${p.color}`,
                    }}
                  />
                }
              >
                {p.title}
              </Button>
            </Popover.Target>
            <Popover.Dropdown>
              <ColorPicker
                value={selectedColor}
                onChange={(color) => {
                  setSelectedColor(color);
                }}
                swatches={[
                  DEFAULT_THEME.colors.red[6],
                  DEFAULT_THEME.colors.pink[6],
                  DEFAULT_THEME.colors.grape[6],
                  DEFAULT_THEME.colors.violet[6],
                  DEFAULT_THEME.colors.indigo[6],
                  DEFAULT_THEME.colors.blue[6],
                  DEFAULT_THEME.colors.cyan[6],
                  DEFAULT_THEME.colors.teal[6],
                  DEFAULT_THEME.colors.green[6],
                  DEFAULT_THEME.colors.lime[6],
                  DEFAULT_THEME.colors.yellow[6],
                  DEFAULT_THEME.colors.orange[6],
                ]}
              />
            </Popover.Dropdown>
          </Popover>
        ))}
      </Group>
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
