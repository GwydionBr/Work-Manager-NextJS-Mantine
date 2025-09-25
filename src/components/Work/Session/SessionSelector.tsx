"use client";

import { useDisclosure } from "@mantine/hooks";
import { useWorkStore } from "@/stores/workManagerStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Group, Text, Divider, Stack, Button, Collapse } from "@mantine/core";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";
import { Tables } from "@/types/db.types";
import DeleteButton from "@/components/UI/Buttons/DeleteButton";
import { IconCashBanknotePlus, IconPencil } from "@tabler/icons-react";
import {
  showActionErrorNotification,
  showActionSuccessNotification,
  showDeleteConfirmationModal,
} from "@/utils/notificationFunctions";

interface SessionSelectorProps {
  selectedSessions: string[];
  timeFilteredSessions: Tables<"timer_session">[];
  toggleAllSessions: () => void;
  handleSessionPayoutClick: (sessions: Tables<"timer_session">[]) => void;
}

export default function SessionSelector({
  selectedSessions,
  timeFilteredSessions,
  toggleAllSessions,
  handleSessionPayoutClick,
}: SessionSelectorProps) {
  const { locale } = useSettingsStore();
  const { deleteTimerSessions } = useWorkStore();
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] =
    useDisclosure(false);

  const handleDelete = () => {
    showDeleteConfirmationModal(
      locale === "de-DE" ? "Auswahl löschen" : "Delete Selection",
      locale === "de-DE"
        ? "Sind Sie sicher, dass Sie diese Auswahl löschen möchten?"
        : "Are you sure you want to delete this selection?",
      async () => {
        const success = await deleteTimerSessions(selectedSessions);
        if (success) {
          showActionSuccessNotification(
            locale === "de-DE"
              ? "Auswahl erfolgreich gelöscht"
              : "Selection deleted successfully",
            locale
          );
        } else {
          showActionErrorNotification(
            locale === "de-DE"
              ? "Auswahl konnte nicht gelöscht werden"
              : "Selection could not be deleted",
            locale
          );
        }
      },
      locale
    );
  };

  const handleEdit = () => {
    openEditModal();
    setTimeout(() => {
      closeEditModal();
    }, 3000);
  };

  return (
    <Stack align="flex-end">
      <Group justify="flex-end" pb="xs">
        <Group
          onClick={toggleAllSessions}
          style={{
            cursor: "pointer",
          }}
        >
          <SelectActionIcon
            onClick={() => {}}
            selected={
              selectedSessions.length ===
              timeFilteredSessions.filter((session) => !session.paid).length
            }
            partiallySelected={
              selectedSessions.length > 0 &&
              selectedSessions.length <
                timeFilteredSessions.filter((session) => !session.paid).length
            }
          />

          <Text fz="sm" c="dimmed">
            {locale === "de-DE" ? "Alle" : "All"}
          </Text>
        </Group>
        <Divider orientation="vertical" />
        <Text size="xs" c="dimmed">
          {selectedSessions.length} /{" "}
          {timeFilteredSessions.filter((session) => !session.paid).length}{" "}
          {locale === "de-DE" ? "Sitzungen" : "Sessions"}
        </Text>
      </Group>
      <Collapse in={selectedSessions.length > 0}>
        <Stack mb="xs">
          <Button
            onClick={() =>
              handleSessionPayoutClick(
                timeFilteredSessions.filter((session) =>
                  selectedSessions.includes(session.id)
                )
              )
            }
            leftSection={<IconCashBanknotePlus />}
            color="violet"
          >
            {locale === "de-DE" ? "Auswahl auszahlen" : "Pay Selection"}
          </Button>
          <Button
            variant="outline"
            onClick={handleEdit}
            leftSection={<IconPencil />}
          >
            {locale === "de-DE" ? "Auswahl bearbeiten" : "Edit Selection"}
          </Button>
          <Collapse in={editModalOpened}>
            <Text>
              {locale === "de-DE" ? "Kommt bald..." : "Coming soon..."}
            </Text>
          </Collapse>
          <DeleteButton
            onClick={handleDelete}
            label={locale === "de-DE" ? "Auswahl löschen" : "Delete Selection"}
          />
        </Stack>
      </Collapse>
    </Stack>
  );
}
