import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconCash, IconBrandCashapp } from "@tabler/icons-react";
import DelayedTooltip from "../DelayedTooltip";

interface PayoutActionIconProps extends ActionIconProps {
  onClick: () => void;
  iconSize?: number;
  iconColor?: string;
  tooltipLabel?: string;
}

export default function PayoutActionIcon({
  onClick,
  iconSize,
  iconColor,
  tooltipLabel,
  ...props
}: PayoutActionIconProps) {
  return (
    <DelayedTooltip label={tooltipLabel}>
      <ActionIcon variant="transparent" onClick={onClick} size="md" {...props}>
        <IconBrandCashapp size={iconSize} color={iconColor} />
      </ActionIcon>
    </DelayedTooltip>
  );
}
