import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";

interface PencilActionIconProps extends ActionIconProps {
  onClick: () => void;
  iconSize?: number;
  iconColor?: string;
}

export default function PencilActionIcon({
  onClick,
  iconSize,
  iconColor,
  ...props
}: PencilActionIconProps) {
  return (
    <ActionIcon variant="transparent" onClick={onClick} size="md" {...props}>
      <IconPencil size={iconSize} color={iconColor} />
    </ActionIcon>
  );
}
