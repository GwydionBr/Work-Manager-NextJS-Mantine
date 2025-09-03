import { ActionIcon, ActionIconProps } from "@mantine/core";
import {
  IconFilter,
  IconFilterFilled,
  IconFilterOff,
  IconFilterCheck,
} from "@tabler/icons-react";
import DelayedTooltip from "../DelayedTooltip";

interface FilterActionIconProps extends ActionIconProps {
  onClick: () => void;
  iconSize?: number;
  iconColor?: string;
  tooltipLabel?: string;
  activeFilter?: boolean;
}

export default function FilterActionIcon({
  onClick,
  iconSize,
  iconColor,
  tooltipLabel,
  activeFilter,
  ...props
}: FilterActionIconProps) {
  return (
    <DelayedTooltip label={tooltipLabel}>
      <ActionIcon onClick={onClick} size="md" variant={activeFilter ? "light" : "subtle"} {...props}>
        {!activeFilter ? (
          <IconFilter size={iconSize} color={iconColor} />
        ) : (
          <IconFilterCheck size={iconSize} color={iconColor}/>
        )}
      </ActionIcon>
    </DelayedTooltip>
  );
}
