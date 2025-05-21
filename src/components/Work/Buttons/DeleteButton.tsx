import { ActionIcon } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

interface EditButtonProps {
  onClick: () => void;
  size?: number;
}

export default function DeleteButton({ onClick, size = 20 }: EditButtonProps) {
  return (
    <ActionIcon onClick={onClick} color="red" variant="transparent">
      <IconTrash size={size} />
    </ActionIcon>
  );
}
