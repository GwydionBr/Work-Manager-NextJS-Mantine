import { Button, ButtonProps } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import DelayedTooltip from "../DelayedTooltip";

interface CreateButtonProps extends ButtonProps {
  onClick: () => void;
  iconSize?: number;
  iconColor?: string;
  title?: string;
  tooltipLabel?: string;
}

export default function CreateButton({
  onClick,
  iconSize,
  iconColor,
  title,
  tooltipLabel,
  ...props
}: CreateButtonProps) {
  return (
    <DelayedTooltip label={tooltipLabel}>
      <Button
        leftSection={<IconCheck size={iconSize} color={iconColor} />}
        variant="outline"
        onClick={onClick}
        {...props}
      >
        {title || "Create"}
      </Button>
    </DelayedTooltip>
  );
}
