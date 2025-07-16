"use client";

import { useDisclosure } from "@mantine/hooks";
import { useGroupStore } from "@/stores/groupStore";

import { Flex, Drawer, Box } from "@mantine/core";
import GroupForm from "@/components/GroupManager/Group/GroupForm";
import PencilActionIcon from "@/components/UI/ActionIcons/PencilActionIcon";
import DeleteButton from "@/components/UI/Buttons/DeleteButton";
import ConfirmDeleteModal from "@/components/UI/ConfirmDeleteModal";

export default function EditGroupButton() {
  const [opened, { open, close }] = useDisclosure(false);
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const { activeGroupId, deleteGroup } = useGroupStore();
  const activeGroup = useGroupStore((state) =>
    state.groups.find((g) => g.id === activeGroupId)
  );

  async function handleDelete() {
    if (activeGroup) {
      const result = await deleteGroup(activeGroup.id);
      if (result) {
        closeDeleteModal();
        close();
      }
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
          <DeleteButton onClick={openDeleteModal} />
        </Flex>
      </Drawer>

      <ConfirmDeleteModal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        title="Delete Group"
        message="Are you sure you want to delete this group? This action cannot be undone."
      />

      <PencilActionIcon aria-label="Edit group" onClick={open} size="md" />
    </Box>
  );
}
