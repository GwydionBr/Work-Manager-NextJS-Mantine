"use client";

import { useSettingsStore } from "@/stores/settingsStore";

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
  const { locale } = useSettingsStore();

  return (
    <DelayedTooltip label={tooltipLabel}>
      <Button
        leftSection={<IconX size={iconSize} color={iconColor} />}
        color="red"
        variant="outline"
        onClick={onClick}
        {...props}
      >
        {locale === "de-DE" ? "Abbrechen" : "Cancel"}
      </Button>
    </DelayedTooltip>
  );
}
