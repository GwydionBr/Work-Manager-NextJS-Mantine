import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconChevronLeft } from "@tabler/icons-react";

interface PrevActionIconProps extends ActionIconProps {
  onClick: () => void;
  iconSize?: number;
  iconColor?: string;
}

export default function PrevActionIcon({
  onClick,
  iconSize,
  iconColor,
  ...props
}: PrevActionIconProps) {
  return (
    <ActionIcon variant="transparent" onClick={onClick} size="md" {...props}>
      <IconChevronLeft size={iconSize} color={iconColor} />
    </ActionIcon>
  );
}
