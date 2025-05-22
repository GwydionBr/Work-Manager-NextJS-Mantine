import { Button, ButtonProps } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

interface DeleteButtonProps extends ButtonProps {
  onClick: () => void;
  iconSize?: number;
  iconColor?: string;
}

export default function DeleteActionIcon({
  onClick,
  iconSize,
  iconColor,
  ...props
}: DeleteButtonProps) {
  return (
    <Button
      leftSection={<IconTrash size={iconSize} color={iconColor} />}
      color="red"
      variant="filled"
      onClick={onClick}
      {...props}
    >
      Delete
    </Button>
  );
}
