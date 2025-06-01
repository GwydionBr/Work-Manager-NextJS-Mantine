import { IconMoon } from "@tabler/icons-react";
import { ActionIcon, HoverCard, Text } from "@mantine/core";

import classes from "./Scheme.module.css";

interface DarkSchemeButtonProps {
  onClick: () => void;
  active: boolean;
  toggleMode: boolean;
}

export default function DarkSchemeButton({
  onClick,
  active,
  toggleMode,
}: DarkSchemeButtonProps) {
  return (
    <HoverCard width={60} position={toggleMode ? "right" : "top"} withArrow shadow="md" openDelay={500}>
      <HoverCard.Target>
        <ActionIcon
          onClick={onClick}
          variant="default"
          size="xl"
          aria-label="select system scheme"
          bg="dark.6"
          className={active ? classes.activeButton : ""}
        >
          <IconMoon className={classes.moonIcon} stroke={1.5} />
        </ActionIcon>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Text size="xs">{toggleMode ? "Light Mode" : "Dark Mode"}</Text>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
