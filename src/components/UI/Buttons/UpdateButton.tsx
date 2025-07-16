import { Button, ButtonProps } from "@mantine/core";
import { IconRotate } from "@tabler/icons-react";
import DelayedTooltip from "../DelayedTooltip";

interface UpdateButtonProps extends ButtonProps {
  onClick: () => void;
  iconSize?: number;
  iconColor?: string;
  title?: string;
  tooltipLabel?: string;
}

export default function UpdateButton({
  onClick,
  iconSize,
  iconColor,
  title,
  tooltipLabel,
  ...props
}: UpdateButtonProps) {
  return (
    <DelayedTooltip label={tooltipLabel}>
      <Button
        leftSection={<IconRotate size={iconSize} color={iconColor} />}
        variant="outline"
        onClick={onClick}
        {...props}
      >
        {title || "Update"}
      </Button>
    </DelayedTooltip>
  );
}
