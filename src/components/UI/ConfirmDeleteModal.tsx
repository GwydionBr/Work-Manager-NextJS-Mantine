import { Group, Modal, Text } from "@mantine/core";
import { IconAlertHexagonFilled } from "@tabler/icons-react";
import DeleteButton from "./Buttons/DeleteButton";
import CancelButton from "./Buttons/CancelButton";

interface ConfirmDeleteModalProps {
  opened: boolean;
  onClose: () => void;
  onDelete: () => void;
  title: string;
  message: string | React.ReactNode;
}

export default function ConfirmDeleteModal({
  opened,
  onClose,
  onDelete,
  title,
  message,
}: ConfirmDeleteModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <IconAlertHexagonFilled size={25} color="red" />
          <Text>{title}</Text>
        </Group>
      }
      centered
    >
      {typeof message === "string" ? <Text>{message}</Text> : message}
      <Group mt="md" justify="flex-end" gap="sm">
        <CancelButton onClick={onClose} color="teal" />
        <DeleteButton onClick={onDelete} />
      </Group>
    </Modal>
  );
}
