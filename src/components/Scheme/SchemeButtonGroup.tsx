"use client";

import { useEffect, useState } from "react";
import { useColorScheme } from "@mantine/hooks";

import {
  Group,
  Space,
  Stack,
  Text,
  useMantineColorScheme,
} from "@mantine/core";
import DarkSchemeButton from "./DarkSchemeButton";
import LightSchemeButton from "./LightSchemeButton";

export default function SchemeToggle() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { colorScheme: currentColorScheme, setColorScheme } =
    useMantineColorScheme();
  const colorScheme = useColorScheme();

  if (!mounted) {
    return null; // verhindert Server/Client-Mismatch
  }

  return (
    <Group justify="center">
      <Stack>
        <Text>Light</Text>
        <LightSchemeButton
          onClick={() => setColorScheme("light")}
          active={currentColorScheme === "light"}
        />
      </Stack>
      <Stack>
        <Text>Dark</Text>
        <DarkSchemeButton
          onClick={() => setColorScheme("dark")}
          active={currentColorScheme === "dark"}
        />
      </Stack>
      <Space w="xl" />
      <Stack>
        <Text>System</Text>
        {colorScheme === "light" ? (
          <LightSchemeButton
            onClick={() => setColorScheme("auto")}
            active={currentColorScheme === "auto"}
          />
        ) : (
          <DarkSchemeButton
            onClick={() => setColorScheme("auto")}
            active={currentColorScheme === "auto"}
          />
        )}
      </Stack>
    </Group>
  );
}
