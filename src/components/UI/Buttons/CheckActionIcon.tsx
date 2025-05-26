import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

interface CheckActionIconProps extends ActionIconProps {
  onClick: () => void;
  iconColor?: string;
  iconSize?: number;
}

export default function CheckActionIcon({
  onClick,
  iconColor,
  iconSize,
  ...props
}: CheckActionIconProps) {
  return (
    <ActionIcon variant="outline" onClick={onClick} color="green" {...props}>
      <IconCheck
        color={
          iconColor ??
          "light-dark(var(--mantine-color-green-9), var(--mantine-color-green-4))"
        }
        size={iconSize ?? 20}
      />
    </ActionIcon>
  );
}
