"use client";

import { useSettingsStore } from "@/stores/settingsStore";


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
  const { locale } = useSettingsStore();

  return (
    <DelayedTooltip label={tooltipLabel}>
      <Button
        leftSection={<IconRotate size={iconSize} color={iconColor} />}
        variant="filled"
        onClick={onClick}
        type={type}
        {...props}
      >
        {title || locale === "de-DE" ? "Speichern" : "Save"}
      </Button>
    </DelayedTooltip>
  );
}
