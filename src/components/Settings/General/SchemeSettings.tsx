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
import DarkSchemeButton from "@/components/Scheme/DarkSchemeButton";
import LightSchemeButton from "@/components/Scheme/LightSchemeButton";
import SystemSchemeButton from "@/components/Scheme/SystemSchemeButton";

export default function SchemeToggle() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { colorScheme: currentColorScheme, setColorScheme } =
    useMantineColorScheme();
  const colorScheme = useColorScheme();

  if (!mounted) {
    return null; // prevents server/client mismatch
  }

  return (
    <Group justify="center">
      <Stack>
        <Text>Light</Text>
        <LightSchemeButton
          onClick={() => setColorScheme("light")}
          active={currentColorScheme === "light"}
          navbarMode={false}
        />
      </Stack>
      <Stack>
        <Text>Dark</Text>
        <DarkSchemeButton
          onClick={() => setColorScheme("dark")}
          active={currentColorScheme === "dark"}
          navbarMode={false}
        />
      </Stack>
      <Space w="xl" />
      <Stack>
        <Text>System</Text>
        <SystemSchemeButton
          onClick={() => setColorScheme("auto")}
          active={currentColorScheme === "auto"}
          navbarMode={false}
        />
      </Stack>
    </Group>
  );
}
