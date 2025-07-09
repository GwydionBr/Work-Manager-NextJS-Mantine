import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconFilter, IconFilterFilled } from "@tabler/icons-react";

interface FilterActionIconProps extends ActionIconProps {
  onClick: () => void;
  iconSize?: number;
  iconColor?: string;
  filled?: boolean;
}

export default function FilterActionIcon({
  onClick,
  iconSize,
  iconColor,
  filled,
  ...props
}: FilterActionIconProps) {
  return (
    <ActionIcon onClick={onClick} size="md" variant="subtle" {...props}>
      {
        filled ? (
          <IconFilterFilled size={iconSize} color={iconColor} />
        ) : (
          <IconFilter size={iconSize} color={iconColor} />
        )
      }
    </ActionIcon>
  );
}
