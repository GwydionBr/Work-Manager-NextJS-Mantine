import { Pencil } from 'lucide-react';
import { ActionIcon } from '@mantine/core';


interface EditButtonProps {
  onClick: () => void;
}

export default function EditButton({ onClick }: EditButtonProps) {
  return(
    <ActionIcon
        variant="transparent"
        aria-label="Edit timerSession"
        onClick={onClick}
        size="sm"
        color="teal"
      >
        <Pencil />
      </ActionIcon>
  )
}