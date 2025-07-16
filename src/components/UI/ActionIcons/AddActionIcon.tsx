import { ActionIcon, ActionIconProps, Tooltip } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import DelayedTooltip from "../DelayedTooltip";

interface AddActionIconProps extends ActionIconProps {
  onClick: () => void;
  tooltipLabel?: string;
  iconSize?: number;
  iconColor?: string;
}

export default function AddActionIcon({
  onClick,
  tooltipLabel,
  iconSize,
  iconColor,
  ...props
}: AddActionIconProps) {
  return (
    <DelayedTooltip label={tooltipLabel}>
      <ActionIcon onClick={onClick} size="md" variant="subtle" {...props}>
        <IconPlus size={iconSize} color={iconColor} />
      </ActionIcon>
    </DelayedTooltip>
  );
}
