import { ActionIcon, ActionIconProps } from "@mantine/core";
import {
  IconFilter,
  IconFilterFilled,
  IconFilterCheck,
} from "@tabler/icons-react";
import DelayedTooltip from "../DelayedTooltip";

interface FilterActionIconProps extends ActionIconProps {
  onClick: () => void;
  iconSize?: number;
  iconColor?: string;
  tooltipLabel?: string;
  activeFilter?: boolean;
  opened?: boolean;
}

export default function FilterActionIcon({
  onClick,
  iconSize,
  iconColor,
  tooltipLabel,
  activeFilter,
  opened,
  ...props
}: FilterActionIconProps) {
  return (
    <DelayedTooltip label={tooltipLabel}>
      <ActionIcon
        onClick={onClick}
        size="md"
        variant={activeFilter ? "light" : "subtle"}
        color={activeFilter || opened ? "blue" : undefined}
        {...props}
      >
        {!activeFilter ? (
          <IconFilter
            size={iconSize}
            color={iconColor}
            fill={opened ? "currentColor" : "none"}
          />
        ) : (
          <IconFilterCheck
            size={iconSize}
            color={iconColor}
            fill={opened ? "currentColor" : "none"}
          />
        )}
      </ActionIcon>
    </DelayedTooltip>
  );
}
