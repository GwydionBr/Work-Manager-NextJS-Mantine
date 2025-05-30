import { Button, Group, Modal, Text } from "@mantine/core";

interface ConfirmDeleteModalProps {
  opened: boolean;
  onClose: () => void;
  onDelete: () => void;
  title: string;
  message: string;
}

export default function ConfirmDeleteModal({
  opened,
  onClose,
  onDelete,
  title,
  message,
}: ConfirmDeleteModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title={title} centered>
      <Text>{message}</Text>
      <Group mt="md" justify="flex-end" gap="sm">
        <Button onClick={onClose} variant="outline">
          Cancel
        </Button>
        <Button onClick={onDelete} color="red">
          Delete
        </Button>
      </Group>
    </Modal>
  );
}
