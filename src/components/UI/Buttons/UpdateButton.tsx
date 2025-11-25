"use client";

import { useFormatter } from "@/hooks/useFormatter";

import { Button, ButtonProps } from "@mantine/core";
import { IconRotate } from "@tabler/icons-react";
import DelayedTooltip from "../DelayedTooltip";

interface UpdateButtonProps extends ButtonProps {
  onClick: () => void;
  iconSize?: number;
  iconColor?: string;
  title?: string;
  tooltipLabel?: string;
  type?: "submit" | "button" | "reset";
}

export default function UpdateButton({
  onClick,
  iconSize,
  iconColor,
  title,
  tooltipLabel,
  type = "button",
  ...props
}: UpdateButtonProps) {
  const { getLocalizedText } = useFormatter();

  return (
    <DelayedTooltip label={tooltipLabel}>
      <Button
        leftSection={<IconRotate size={iconSize} color={iconColor} />}
        variant="filled"
        onClick={onClick}
        type={type}
        {...props}
      >
        {title || getLocalizedText("Speichern", "Save")}
      </Button>
    </DelayedTooltip>
  );
}
