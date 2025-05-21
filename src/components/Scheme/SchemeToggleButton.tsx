"use client";

import { useEffect, useState } from "react";

import {
  Group,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import LightSchemeButton from "./LightSchemeButton";
import DarkSchemeButton from "./DarkSchemeButton";

export default function SchemeToggle() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { toggleColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });

  if (!mounted) {
    return null; // verhindert Server/Client-Mismatch
  }

  return (
    <Group justify="center">
      {computedColorScheme === "dark" ? (
        <DarkSchemeButton onClick={toggleColorScheme} active={false} />
      ) : (
        <LightSchemeButton onClick={toggleColorScheme} active={false} />
      )}
    </Group>
  );
}
