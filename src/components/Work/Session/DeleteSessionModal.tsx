import { Button, Flex, Modal } from '@mantine/core';

export default function DeleteSessionModal({
  opened,
  onClose,
  onDelete,
}: {
  opened: boolean;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <Modal opened={opened} onClose={onClose} title="Delete Session?" centered>
      <p>This action can't be undon</p>
      <Flex mt="md" justify="flex-end" gap="sm">
        <Button onClick={onClose} variant="outline">
          Cancel
        </Button>
        <Button onClick={onDelete} color="red">
          Yes, delete
        </Button>
      </Flex>
    </Modal>
  );
}
