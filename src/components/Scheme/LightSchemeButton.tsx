import { IconSun } from "@tabler/icons-react";
import { ActionIcon, HoverCard, Text } from "@mantine/core";

import classes from "./Scheme.module.css";

interface LightSchemeButtonProps {
  onClick: () => void;
  active: boolean;
  toggleMode: boolean;
}

export default function LightSchemeButton({
  onClick,
  active,
  toggleMode,
}: LightSchemeButtonProps) {
  return (
    <HoverCard
      width={60}
      position={toggleMode ? "right" : "top"}
      withArrow
      shadow="md"
      openDelay={500}
    >
      <HoverCard.Target>
        <ActionIcon
          onClick={onClick}
          variant="default"
          size="xl"
          aria-label="select system scheme"
          bg="yellow.2"
          className={active ? classes.activeButton : ""}
        >
          <IconSun className={classes.sunIcon} stroke={1.5} />
        </ActionIcon>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Text size="xs">{toggleMode ? "Dark Mode" : "Light Mode"}</Text>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
