"use client";

import { useFormatter } from "@/hooks/useFormatter";

import { Button, ButtonProps } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import DelayedTooltip from "../DelayedTooltip";

interface CreateButtonProps extends ButtonProps {
  onClick: () => void;
  type?: "submit" | "button" | "reset";
  iconSize?: number;
  iconColor?: string;
  title?: string;
  tooltipLabel?: string;
}

export default function CreateButton({
  onClick,
  type = "button",
  iconSize,
  iconColor,
  title,
  tooltipLabel,
  ...props
}: CreateButtonProps) {
  const { getLocalizedText } = useFormatter();

  return (
    <DelayedTooltip label={tooltipLabel}>
      <Button
        leftSection={<IconCheck size={iconSize} color={iconColor} />}
        type={type}
        variant="filled"
        onClick={onClick}
        {...props}
      >
        {title || getLocalizedText("Erstellen", "Create")}
      </Button>
    </DelayedTooltip>
  );
}
