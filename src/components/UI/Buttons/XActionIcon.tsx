import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconX } from "@tabler/icons-react";

interface XActionIconProps extends ActionIconProps {
  onClick: () => void;
  iconColor?: string;
  iconSize?: number;
}

export default function XActionIcon({
  onClick,
  iconColor,
  iconSize,
  ...props
}: XActionIconProps) {
  return (
    <ActionIcon variant="outline" onClick={onClick} color="red" {...props}>
      <IconX
        color={
          iconColor ??
          "light-dark(var(--mantine-color-red-9), var(--mantine-color-red-4))"
        }
        size={iconSize ?? 20}
      />
    </ActionIcon>
  );
}
