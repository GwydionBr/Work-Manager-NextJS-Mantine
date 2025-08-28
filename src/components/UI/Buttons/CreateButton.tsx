"use client";

import { useSettingsStore } from "@/stores/settingsStore";

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
  const { locale } = useSettingsStore();

  return (
    <DelayedTooltip label={tooltipLabel}>
      <Button
        leftSection={<IconCheck size={iconSize} color={iconColor} />}
        type={type}
        variant="filled"
        onClick={onClick}
        {...props}
      >
        {title || locale === "de-DE" ? "Erstellen" : "Create"}
      </Button>
    </DelayedTooltip>
  );
}
