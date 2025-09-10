"use client";

import { useDisclosure } from "@mantine/hooks";
import { useWorkStore } from "@/stores/workManagerStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Group, Text, Divider, Stack, Button, Collapse } from "@mantine/core";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";
import { Tables } from "@/types/db.types";
import DeleteButton from "@/components/UI/Buttons/DeleteButton";
import { IconPencil } from "@tabler/icons-react";
import ConfirmDeleteModal from "@/components/UI/ConfirmDeleteModal";

interface SessionSelectorProps {
  selectedSessions: string[];
  timeFilteredSessions: Tables<"timer_session">[];
  toggleAllSessions: () => void;
}

export default function SessionSelector({
  selectedSessions,
  timeFilteredSessions,
  toggleAllSessions,
}: SessionSelectorProps) {
  const { locale } = useSettingsStore();
  const { deleteTimerSessions } = useWorkStore();
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);

  const handleDelete = async () => {
    const success = await deleteTimerSessions(selectedSessions);
    if (success) {
      closeDeleteModal();
    }
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
              timeFilteredSessions.filter((session) => !session.payed).length
            }
            partiallySelected={
              selectedSessions.length > 0 &&
              selectedSessions.length <
                timeFilteredSessions.filter((session) => !session.payed).length
            }
          />

          <Text fz="sm" c="dimmed">
            {locale === "de-DE" ? "Alle" : "All"}
          </Text>
        </Group>
        <Divider orientation="vertical" />
        <Text size="xs" c="dimmed">
          {selectedSessions.length} /{" "}
          {timeFilteredSessions.filter((session) => !session.payed).length}{" "}
          {locale === "de-DE" ? "Sitzungen" : "Sessions"}
        </Text>
      </Group>
      <Collapse in={selectedSessions.length > 0}>
        <Stack mb="xs">
          <Button
            variant="outline"
            onClick={() => {}}
            leftSection={<IconPencil />}
          >
            {locale === "de-DE" ? "Auswahl bearbeiten" : "Edit Selection"}
          </Button>
          <DeleteButton
            onClick={openDeleteModal}
            label={locale === "de-DE" ? "Auswahl löschen" : "Delete Selection"}
          />
        </Stack>
      </Collapse>
      <ConfirmDeleteModal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        title={locale === "de-DE" ? "Auswahl löschen" : "Delete Selection"}
        message={
          locale === "de-DE"
            ? "Sind Sie sicher, dass Sie diese Auswahl löschen möchten?"
            : "Are you sure you want to delete this selection?"
        }
      />
    </Stack>
  );
}
