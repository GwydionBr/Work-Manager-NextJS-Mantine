"use client";

import { Modal, Text, Group, Button, Stack } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";

interface UpdateRecurringCashFlowsModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function UpdateRecurringCashFlowsModal({
  opened,
  onClose,
  onConfirm,
  onCancel,
  isLoading = false,
}: UpdateRecurringCashFlowsModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Update Existing Cash Flows"
      size="md"
      centered
    >
      <Stack gap="md">
        <Group gap="sm">
          <IconAlertTriangle size={24} color="orange" />
          <Text size="sm" c="dimmed">
            You've made changes to a recurring cash flow. Would you like to
            update all existing single cash flows that were created from this
            recurring pattern?
          </Text>
        </Group>

        <Text size="sm" c="dimmed">
          This will update the title, amount, currency, and category of all past
          and current cash flows that were generated from this recurring
          pattern. Future cash flows will automatically use the new settings.
        </Text>

        <Group justify="flex-end" gap="sm">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            No, keep existing
          </Button>
          <Button color="blue" onClick={onConfirm} loading={isLoading}>
            Yes, update all
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
