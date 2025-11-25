"use client";

import { useColorScheme } from "@mantine/hooks";
import { useFormatter } from "@/hooks/useFormatter";

import { IconSunMoon } from "@tabler/icons-react";
import { ActionIcon, HoverCard, Text } from "@mantine/core";

import classes from "./Scheme.module.css";

interface SystemSchemeButtonProps {
  onClick: () => void;
  active: boolean;
  navbarMode: boolean;
}

export default function SystemSchemeButton({
  onClick,
  active,
  navbarMode,
}: SystemSchemeButtonProps) {
  const colorScheme = useColorScheme();
  const { getLocalizedText } = useFormatter();
  
  return (
    <HoverCard
      width={80}
      position={navbarMode ? "right" : "top"}
      withArrow
      shadow="md"
      openDelay={500}
    >
      <HoverCard.Target>
        <ActionIcon
          onClick={onClick}
          variant="default"
          size="xl"
          aria-label={getLocalizedText("Systemmodus auswählen", "Select system scheme")}
          bg={
            colorScheme === "light"
              ? "var(--mantine-color-gray-0)"
              : "var(--mantine-color-dark-6)"
          }
          className={active ? classes.activeButton : ""}
        >
          <IconSunMoon
            color={
              colorScheme === "light"
                ? "var(--mantine-color-teal-7)"
                : "var(--mantine-color-teal-4)"
            }
            stroke={1.5}
          />
        </ActionIcon>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Text size="xs">
          {getLocalizedText("Systemschema", "System Scheme")}
        </Text>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
