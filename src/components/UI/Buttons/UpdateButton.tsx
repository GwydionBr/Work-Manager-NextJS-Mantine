import { Button, ButtonProps } from "@mantine/core";
import { IconRotate } from "@tabler/icons-react";

interface UpdateButtonProps extends ButtonProps {
  onClick: () => void;
  iconSize?: number;
  iconColor?: string;
  title?: string;
}

export default function UpdateButton({
  onClick,
  iconSize,
  iconColor,
  title,
  ...props
}: UpdateButtonProps) {
  return (
    <Button
      leftSection={<IconRotate size={iconSize} color={iconColor} />}
      variant="outline"
      onClick={onClick}
      {...props}
    >
      {title || "Update"}
    </Button>
  );
}
