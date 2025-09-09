import { ActionIcon, ActionIconProps } from "@mantine/core";
import {
  IconSquareRounded,
  IconSquareRoundedCheck,
  IconSquareRoundedCheckFilled,
} from "@tabler/icons-react";
import DelayedTooltip from "../DelayedTooltip";
import React from "react";

interface SelectActionIconProps extends ActionIconProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  iconSize?: number;
  iconColor?: string;
  tooltipLabel?: string;
  selected?: boolean;
  filled?: boolean;
}

export default function SelectActionIcon({
  onClick,
  iconSize,
  iconColor,
  tooltipLabel,
  selected,
  filled,
  ...props
}: SelectActionIconProps) {
  return (
    <DelayedTooltip label={tooltipLabel}>
      <ActionIcon
        onClick={onClick}
        size="md"
        variant="transparent"
        color={selected ? "blue" : undefined}
        {...props}
      >
        {filled ? (
          <IconSquareRoundedCheckFilled size={iconSize} color={iconColor} />
        ) : selected ? (
          <IconSquareRoundedCheck size={iconSize} color={iconColor} />
        ) : (
          <IconSquareRounded size={iconSize} color={iconColor} />
        )}
      </ActionIcon>
    </DelayedTooltip>
  );
}
