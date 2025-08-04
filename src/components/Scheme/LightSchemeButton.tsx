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
          aria-label="select light scheme"
          bg="light-dark(var(--mantine-color-white), var(--mantine-color-white))"
          className={active ? classes.activeButton : ""}
        >
          <IconSunHighFilled color="var(--mantine-color-teal-7)" stroke={1.5} />
        </ActionIcon>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Text size="xs">{navbarMode ? "Dark Mode" : "Light Mode"}</Text>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
