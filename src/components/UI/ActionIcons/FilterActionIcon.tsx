import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconFilter, IconFilterFilled } from "@tabler/icons-react";
import DelayedTooltip from "../DelayedTooltip";

interface FilterActionIconProps extends ActionIconProps {
  onClick: () => void;
  iconSize?: number;
  iconColor?: string;
  filled?: boolean;
  tooltipLabel?: string;
}

export default function FilterActionIcon({
  onClick,
  iconSize,
  iconColor,
  filled,
  tooltipLabel,
  ...props
}: FilterActionIconProps) {
  return (
    <DelayedTooltip label={tooltipLabel}>
      <ActionIcon onClick={onClick} size="md" variant="subtle" {...props}>
        {
          filled ? (
          <IconFilterFilled size={iconSize} color={iconColor} />
        ) : (
          <IconFilter size={iconSize} color={iconColor} />
        )
        }
      </ActionIcon>
    </DelayedTooltip>
  );
}
