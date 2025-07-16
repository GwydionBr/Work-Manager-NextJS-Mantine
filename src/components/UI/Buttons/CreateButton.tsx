import { Button, ButtonProps } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

interface CreateButtonProps extends ButtonProps {
  onClick: () => void;
  iconSize?: number;
  iconColor?: string;
  title?: string;
}

export default function CreateButton({
  onClick,
  iconSize,
  iconColor,
  title,
  ...props
}: CreateButtonProps) {
  return (
    <Button
      leftSection={<IconCheck size={iconSize} color={iconColor} />}
      variant="outline"
      onClick={onClick}
      {...props}
    >
      {title || "Create"}
    </Button>
  );
}
