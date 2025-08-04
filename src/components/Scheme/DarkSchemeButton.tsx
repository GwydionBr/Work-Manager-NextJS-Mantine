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
          aria-label="select dark scheme"
          bg="var(--mantine-color-dark-6)"
          className={active ? classes.activeButton : ""}
        >
          <IconMoonStars color="var(--mantine-color-teal-4)" stroke={1.5} />
        </ActionIcon>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Text size="xs">{navbarMode ? "Light Mode" : "Dark Mode"}</Text>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
