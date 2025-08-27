import { Button, Group, Modal, Text } from "@mantine/core";
import { useSettingsStore } from "@/stores/settingsStore";

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
  const { locale } = useSettingsStore();

  return (
    <Modal opened={opened} onClose={onClose} title={title} centered>
      <Text>{message}</Text>
      <Group mt="md" justify="flex-end" gap="sm">
        <Button onClick={onClose} variant="outline">
          {locale === "de-DE" ? "Abbrechen" : "Cancel"}
        </Button>
        <Button onClick={onDelete} color="red">
          {locale === "de-DE" ? "Löschen" : "Delete"}
        </Button>
      </Group>
    </Modal>
  );
}
