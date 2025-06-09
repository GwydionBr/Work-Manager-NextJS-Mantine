import { Button, ButtonProps } from "@mantine/core";
import { IconX } from "@tabler/icons-react";

interface CancelButtonProps extends ButtonProps {
  onClick: () => void;
  iconSize?: number;
  iconColor?: string;
}

export default function CancelButton({
  onClick,
  iconSize,
  iconColor,
  ...props
}: CancelButtonProps) {
  return (
    <Button
      leftSection={<IconX size={iconSize} color={iconColor} />}
      color="red"
      variant="outline"
      onClick={onClick}
      {...props}
    >
      Cancel
    </Button>
  );
}
