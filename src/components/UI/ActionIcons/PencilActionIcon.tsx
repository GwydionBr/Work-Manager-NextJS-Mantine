import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import DelayedTooltip from "../DelayedTooltip";

interface PencilActionIconProps extends ActionIconProps {
  onClick: () => void;
  iconSize?: number;
  iconColor?: string;
  tooltipLabel?: string;
}

export default function PencilActionIcon({
  onClick,
  iconSize,
  iconColor,
  tooltipLabel,
  ...props
}: PencilActionIconProps) {
  return (
    <DelayedTooltip label={tooltipLabel}>
      <ActionIcon variant="transparent" onClick={onClick} size="md" {...props}>
        <IconPencil size={iconSize} color={iconColor} />
      </ActionIcon>
    </DelayedTooltip>
  );
}
