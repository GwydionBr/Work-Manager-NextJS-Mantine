"use client";

import { useFormatter } from "@/hooks/useFormatter";

import { IconMoonStars } from "@tabler/icons-react";
import { ActionIcon, HoverCard, Text } from "@mantine/core";

import classes from "./Scheme.module.css";

interface DarkSchemeButtonProps {
  onClick: () => void;
  active: boolean;
  navbarMode: boolean;
}

export default function DarkSchemeButton({
  onClick,
  active,
  navbarMode,
}: DarkSchemeButtonProps) {
  const { getLocalizedText } = useFormatter();
  return (
    <HoverCard
      width={60}
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
          aria-label={getLocalizedText(
            "Dunkler Modus auswählen",
            "Select dark scheme"
          )}
          bg="var(--mantine-color-dark-6)"
          className={active ? classes.activeButton : ""}
        >
          <IconMoonStars color="var(--mantine-color-teal-4)" stroke={1.5} />
        </ActionIcon>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Text size="xs">
          {navbarMode
            ? getLocalizedText("Heller Modus", "Light Mode")
            : getLocalizedText("Dunkler Modus", "Dark Mode")}
        </Text>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
