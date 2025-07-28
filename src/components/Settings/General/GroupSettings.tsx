"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/stores/settingsStore";

import { Box, DEFAULT_THEME, Group, Popover, Text } from "@mantine/core";

import classes from "./DefaultSettings.module.css";
import DefaultColorPicker from "@/components/UI/DefaultColorPicker";

export default function GroupSettings() {
  const { defaultGroupColor: groupColor, setDefaultGroupColor: setGroupColor } =
    useSettingsStore();
  const [color, setColor] = useState<string | null>(null);

  useEffect(() => {
    setColor(groupColor);
  }, [groupColor]);

  function handleColorChange() {
    setGroupColor(color);
  }

  return (
    <Group>
      <Text size="sm" fw={500}>
        Default Group Color
      </Text>
      <Popover onClose={handleColorChange} position="top">
        <Popover.Target>
          <Box
            className={classes.colorPoint}
            bg={
              color ||
              "light-dark(var(--mantine-color-gray-8), var(--mantine-color-dark-2))"
            }
          />
        </Popover.Target>
        <Popover.Dropdown>
          <DefaultColorPicker
            color={color || DEFAULT_THEME.colors.lime[6]}
            setColor={setColor}
          />
        </Popover.Dropdown>
      </Popover>
    </Group>
  );
}
