import { Trash2 } from 'lucide-react';
import { ActionIcon } from '@mantine/core';


interface EditButtonProps {
  onClick: () => void;
}

export default function DeleteButton({ onClick }: EditButtonProps) {
  return (
    <ActionIcon onClick={onClick} color="red" variant="transparent">
      <Trash2 size={20} />
    </ActionIcon>
  );
}