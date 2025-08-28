"use client";

import { useSettingsStore } from "@/stores/settingsStore";

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
  const { locale } = useSettingsStore();
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        locale === "de-DE"
          ? "Bestehende Cashflows aktualisieren"
          : "Update Existing Cash Flows"
      }
      size="md"
      centered
    >
      <Stack gap="md">
        <Group gap="sm">
          <IconAlertTriangle size={24} color="orange" />
          <Text size="sm" c="dimmed">
            {locale === "de-DE"
              ? "Sie haben Änderungen an einem wiederkehrenden Cashflow vorgenommen. Möchten Sie alle bestehenden Einmalzahlungen, die aus diesem Wiederholungsmuster erstellt wurden, aktualisieren?"
              : "You've made changes to a recurring cash flow. Would you like to update all existing single cash flows that were created from this recurring pattern?"}
          </Text>
        </Group>

        <Text size="sm" c="dimmed">
          {locale === "de-DE"
            ? "Dies wird den Titel, den Betrag, die Währung und die Kategorie aller vergangenen und aktuellen Cashflows aktualisieren, die aus diesem Wiederholungsmuster generiert wurden. Zukünftige Cashflows werden automatisch die neuen Einstellungen verwenden."
            : "This will update the title, amount, currency, and category of all past and current cash flows that were generated from this recurring pattern. Future cash flows will automatically use the new settings."}
        </Text>

        <Group justify="flex-end" gap="sm">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {locale === "de-DE" ? "Nein, beibehalten" : "No, keep existing"}
          </Button>
          <Button color="blue" onClick={onConfirm} loading={isLoading}>
            {locale === "de-DE" ? "Ja, aktualisieren" : "Yes, update all"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
