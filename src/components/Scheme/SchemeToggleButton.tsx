"use client";

import { useEffect, useState } from "react";
import { useHotkeys } from "@mantine/hooks";

import {
  Group,
  HoverCard,
  useComputedColorScheme,
  useMantineColorScheme,
  Text,
} from "@mantine/core";
import LightSchemeButton from "./LightSchemeButton";
import DarkSchemeButton from "./DarkSchemeButton";

export default function SchemeToggle() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { toggleColorScheme } = useMantineColorScheme();
  useHotkeys([["mod + J", () => toggleColorScheme()]]);
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });

  if (!mounted) {
    return null; // prevents server/client mismatch
  }

  return (
    <Group justify="center">
      {computedColorScheme === "dark" ? (
        <DarkSchemeButton onClick={toggleColorScheme} active={false} toggleMode={true} />
      ) : (
        <LightSchemeButton onClick={toggleColorScheme} active={false} toggleMode={true} />
      )}
    </Group>
  );
}
