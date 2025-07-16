import { Button, ButtonProps } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import DelayedTooltip from "../DelayedTooltip";

interface DeleteButtonProps extends ButtonProps {
  onClick: () => void;
  iconSize?: number;
  iconColor?: string;
  tooltipLabel?: string;
}

export default function DeleteActionIcon({
  onClick,
  iconSize,
  iconColor,
  tooltipLabel,
  ...props
}: DeleteButtonProps) {
  return (
    <DelayedTooltip label={tooltipLabel}>
      <Button
        leftSection={<IconTrash size={iconSize} color={iconColor} />}
        color="red"
        variant="filled"
        onClick={onClick}
        {...props}
      >
        Delete
      </Button>
    </DelayedTooltip>
  );
}
