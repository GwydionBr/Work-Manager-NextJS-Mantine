import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

interface DeleteActionIconProps extends ActionIconProps {
  onClick: () => void;
  iconSize?: number;
  iconColor?: string;
}

export default function DeleteActionIcon({
  onClick,
  iconSize,
  iconColor,
  ...props
}: DeleteActionIconProps) {
  return (
    <ActionIcon
      onClick={onClick}
      color="red"
      size="md"
      variant="transparent"
      {...props}
    >
      <IconTrash size={iconSize} color={iconColor} />
    </ActionIcon>
  );
}
