import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

interface AddActionIconProps extends ActionIconProps {
  onClick: () => void;
  iconSize?: number;
  iconColor?: string;
}

export default function AddActionIcon({
  onClick,
  iconSize,
  iconColor,
  ...props
}: AddActionIconProps) {
  return (
    <ActionIcon
      onClick={onClick}
      size="md"
      variant="transparent"
      {...props}
    >
      <IconPlus size={iconSize} color={iconColor} />
    </ActionIcon>
  );
}
