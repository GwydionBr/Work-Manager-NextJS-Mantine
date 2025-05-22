import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";

interface EditActionIconProps extends ActionIconProps {
  onClick: () => void;
  iconSize?: number;
  iconColor?: string;
}

export default function EditActionIcon({
  onClick,
  iconSize,
  iconColor,
  ...props
}: EditActionIconProps) {
  return (
    <ActionIcon
      variant="transparent"
      onClick={onClick}
      size="md"
      {...props}
    >
      <IconPencil size={iconSize} color={iconColor} />
    </ActionIcon>
  );
}
