"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/stores/settingsStore";

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
  const { locale } = useSettingsStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { colorScheme: currentColorScheme, setColorScheme } =
    useMantineColorScheme();

  if (!mounted) {
    return null; // prevents server/client mismatch
  }

  return (
    <Group justify="center">
      <Stack>
        <Text>{locale === "de-DE" ? "Hell" : "Light"}</Text>
        <LightSchemeButton
          onClick={() => setColorScheme("light")}
          active={currentColorScheme === "light"}
          navbarMode={false}
        />
      </Stack>
      <Stack>
        <Text>{locale === "de-DE" ? "Dunkel" : "Dark"}</Text>
        <DarkSchemeButton
          onClick={() => setColorScheme("dark")}
          active={currentColorScheme === "dark"}
          navbarMode={false}
        />
      </Stack>
      <Space w="xl" />
      <Stack>
        <Text>{locale === "de-DE" ? "System" : "System"}</Text>
        <SystemSchemeButton
          onClick={() => setColorScheme("auto")}
          active={currentColorScheme === "auto"}
          navbarMode={false}
        />
      </Stack>
    </Group>
  );
}
