"use client";

import { useDisclosure } from "@mantine/hooks";
import { useGroupStore } from "@/stores/groupStore";

import { useFormatter } from "@/hooks/useFormatter";

import { Flex, Drawer, Box } from "@mantine/core";
import GroupForm from "@/components/GroupManager/Group/GroupForm";
import DeleteButton from "@/components/UI/Buttons/DeleteButton";
import EditActionIcon from "@/components/UI/ActionIcons/EditActionIcon";
import {
  showDeleteConfirmationModal,
  showActionSuccessNotification,
  showActionErrorNotification,
} from "@/utils/notificationFunctions";

export default function EditGroupButton() {
  const [opened, { open, close }] = useDisclosure(false);
  const { activeGroupId, deleteGroup } = useGroupStore();
  const activeGroup = useGroupStore((state) =>
    state.groups.find((g) => g.id === activeGroupId)
  );
  const { getLocalizedText } = useFormatter();

  async function handleDelete() {
    if (activeGroup) {
      showDeleteConfirmationModal(
        getLocalizedText("Gruppe löschen", "Delete Group"),
        getLocalizedText(
          "Sind Sie sicher, dass Sie diese Gruppe löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.",
          "Are you sure you want to delete this group? This action cannot be undone."
        ),
        async () => {
          const result = await deleteGroup(activeGroup.id);
          if (result) {
            close();
            showActionSuccessNotification(
              getLocalizedText(
                "Gruppe erfolgreich gelöscht",
                "Group deleted successfully"
              )
            );
          } else {
            showActionErrorNotification(
              getLocalizedText(
                "Gruppe konnte nicht gelöscht werden",
                "Group could not be deleted"
              )
            );
          }
        }
      );
    }
  }

  return (
    <Box>
      <Drawer
        opened={opened}
        onClose={close}
        title="Edit Group"
        size="md"
        padding="md"
      >
        <Flex direction="column" gap="xl">
          <GroupForm onClose={close} group={activeGroup} />
          <DeleteButton onClick={handleDelete} />
        </Flex>
      </Drawer>

      <EditActionIcon
        aria-label="Edit group"
        onClick={open}
        size="md"
        tooltipLabel="Edit group"
      />
    </Box>
  );
}
