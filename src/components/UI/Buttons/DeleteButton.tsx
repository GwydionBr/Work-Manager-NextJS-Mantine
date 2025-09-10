"use client";

import { useSettingsStore } from "@/stores/settingsStore";

import { Button, ButtonProps } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import DelayedTooltip from "../DelayedTooltip";

interface DeleteButtonProps extends ButtonProps {
  onClick: () => void;
  iconSize?: number;
  iconColor?: string;
  tooltipLabel?: string;
  label?: string;
}

export default function DeleteActionIcon({
  onClick,
  iconSize,
  iconColor,
  tooltipLabel,
  label,
  ...props
}: DeleteButtonProps) {
  const { locale } = useSettingsStore();

  return (
    <DelayedTooltip label={tooltipLabel}>
      <Button
        leftSection={<IconTrash size={iconSize} color={iconColor} />}
        color="red"
        variant="filled"
        onClick={onClick}
        {...props}
      >
        {label ? label : locale === "de-DE" ? "Löschen" : "Delete"}
      </Button>
    </DelayedTooltip>
  );
}
