"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/stores/settingsStore";

import { Box, ColorPicker, Group, Popover, Text } from "@mantine/core";

import classes from "./Settings.module.css";

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
          <ColorPicker
            format="hex"
            value={color || "#40c057"}
            onChange={setColor}
            swatches={[
              "#2e2e2e",
              "#868e96",
              "#fa5252",
              "#e64980",
              "#be4bdb",
              "#7950f2",
              "#4c6ef5",
              "#228be6",
              "#15aabf",
              "#12b886",
              "#40c057",
              "#82c91e",
              "#fab005",
              "#fd7e14",
            ]}
          />
        </Popover.Dropdown>
      </Popover>
    </Group>
  );
}
