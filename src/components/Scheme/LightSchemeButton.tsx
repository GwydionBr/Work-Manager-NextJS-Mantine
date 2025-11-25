"use client";
import { useFormatter } from "@/hooks/useFormatter";

import { IconSunHighFilled } from "@tabler/icons-react";
import { ActionIcon, HoverCard, Text } from "@mantine/core";

import classes from "./Scheme.module.css";

interface LightSchemeButtonProps {
  onClick: () => void;
  active: boolean;
  navbarMode: boolean;
}

export default function LightSchemeButton({
  onClick,
  active,
  navbarMode,
}: LightSchemeButtonProps) {
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
            "Heller Modus auswählen",
            "Select light scheme"
          )}
          bg="light-dark(var(--mantine-color-white), var(--mantine-color-white))"
          className={active ? classes.activeButton : ""}
        >
          <IconSunHighFilled color="var(--mantine-color-teal-7)" stroke={1.5} />
        </ActionIcon>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Text size="xs">
          {navbarMode
            ? getLocalizedText("Dunkler Modus", "Dark Mode")
            : getLocalizedText("Heller Modus", "Light Mode")}
        </Text>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
