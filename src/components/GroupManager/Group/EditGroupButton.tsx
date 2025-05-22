"use client";

import { useDisclosure } from "@mantine/hooks";
import { useGroupStore } from "@/stores/groupStore";

import { ActionIcon, Flex, Drawer } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import GroupForm from "@/components/GroupManager/Group/GroupForm";

export default function EditGroupButton() {
  const [opened, { open, close }] = useDisclosure(false);
  const { activeGroup } = useGroupStore();

  return (
    <>
      <Drawer
        opened={opened}
        onClose={close}
        title="Edit Group"
        size="md"
        padding="md"
      >
        <Flex direction="column" gap="xl">
          <GroupForm
            onClose={close}
            group={activeGroup}
          />
        </Flex>
      </Drawer>

      <ActionIcon
        variant="transparent"
        aria-label="Edit group"
        onClick={open}
        size="md"
      >
        <IconPencil size={24} />
      </ActionIcon>
    </>
  );
}
