import { Button, Flex, Modal } from '@mantine/core';

export default function DeleteProjectModal({
  opened,
  onClose,
  onDelete,
}: {
  opened: boolean;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <Modal opened={opened} onClose={onClose} title="Projekt löschen?" centered>
      <p>Dieses Projekt kann nicht wiederhergestellt werden. Möchtest du es wirklich löschen?</p>
      <Flex mt="md" justify="flex-end" gap="sm">
        <Button onClick={onClose} variant="outline">
          Abbrechen
        </Button>
        <Button onClick={onDelete} color="red">
          Ja, löschen
        </Button>
      </Flex>
    </Modal>
  );
}
