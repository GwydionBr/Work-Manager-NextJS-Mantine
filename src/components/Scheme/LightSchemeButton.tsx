import { IconSun } from "@tabler/icons-react";
import { ActionIcon } from "@mantine/core";
import classes from "./Scheme.module.css";

interface LightSchemeButtonProps {
  onClick: () => void;
  active: boolean;
}

export default function LightSchemeButton({
  onClick,
  active,
}: LightSchemeButtonProps) {

  return (
    <ActionIcon
      onClick={onClick}
      variant="default"
      size="xl"
      aria-label="select system scheme"
      style={{
        backgroundColor: "var(--mantine-color-yellow-2)",
      }}
      className={active ? classes.activeButton : ""}
    >
      <IconSun className={classes.sunIcon} stroke={1.5} />
    </ActionIcon>
  );
}
