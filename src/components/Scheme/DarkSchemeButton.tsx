import { IconMoon } from "@tabler/icons-react";
import { ActionIcon, useComputedColorScheme } from "@mantine/core";
import classes from "./Scheme.module.css";

interface DarkSchemeButtonProps {
  onClick: () => void;
  active: boolean;
}

export default function DarkSchemeButton({
  onClick,
  active,
}: DarkSchemeButtonProps) {
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });

  return (
    <ActionIcon
      onClick={onClick}
      variant="default"
      size="xl"
      aria-label="select system scheme"
      className={active ? classes.active : ""}
    >
      <IconMoon className={classes.moonIcon} stroke={1.5} />
    </ActionIcon>
  );
}
