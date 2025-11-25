"use client";

import { useFormatter } from "@/hooks/useFormatter";

import { Button, ButtonProps } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import DelayedTooltip from "../DelayedTooltip";

interface CancelButtonProps extends ButtonProps {
  onClick: () => void;
  iconSize?: number;
  iconColor?: string;
  tooltipLabel?: string;
}

export default function CancelButton({
  onClick,
  iconSize,
  iconColor,
  tooltipLabel,
  ...props
}: CancelButtonProps) {
  const { getLocalizedText } = useFormatter();

  return (
    <DelayedTooltip label={tooltipLabel}>
      <Button
        leftSection={<IconX size={iconSize} color={iconColor} />}
        color="red"
        variant="outline"
        onClick={onClick}
        {...props}
      >
        {getLocalizedText("Abbrechen", "Cancel")}
      </Button>
    </DelayedTooltip>
  );
}
