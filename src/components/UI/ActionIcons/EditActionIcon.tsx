import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";

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
    <ActionIcon variant="light" onClick={onClick} size="md" {...props}>
      <IconEdit size={iconSize} color={iconColor} />
    </ActionIcon>
  );
}
