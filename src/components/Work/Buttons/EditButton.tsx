import { ActionIcon } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";

interface EditButtonProps {
  onClick: () => void;
  size?: number;
}

export default function EditButton({ onClick, size = 20 }: EditButtonProps) {
  return (
    <ActionIcon
      variant="transparent"
      aria-label="Edit timerSession"
      onClick={onClick}
      size="sm"
      color="teal"
    >
      <IconPencil size={size} />
    </ActionIcon>
  );
}
