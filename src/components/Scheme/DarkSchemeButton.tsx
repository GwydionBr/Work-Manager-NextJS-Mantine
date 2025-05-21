import { IconMoon } from "@tabler/icons-react";
import { ActionIcon } from "@mantine/core";

import classes from "./Scheme.module.css";

interface DarkSchemeButtonProps {
  onClick: () => void;
  active: boolean;
}

export default function DarkSchemeButton({
  onClick,
  active,
}: DarkSchemeButtonProps) {
  return (
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
  );
}
