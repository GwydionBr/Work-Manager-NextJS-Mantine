import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

interface NextActionIconProps extends ActionIconProps {
  onClick: () => void;
  iconSize?: number;
  iconColor?: string;
}

export default function NextActionIcon({
  onClick,
  iconSize,
  iconColor,
  ...props
}: NextActionIconProps) {
  return (
    <ActionIcon variant="transparent" onClick={onClick} size="md" {...props}>
      <IconChevronRight size={iconSize} color={iconColor} />
    </ActionIcon>
  );
}
