"use client";

import { useDisclosure } from "@mantine/hooks";

import { ActionIcon, Flex, Modal } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import GroupForm from "@/components/GroupManager/Group/GroupForm";

export default function NewGroupButton() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Modal
        opened={opened}
        closeOnClickOutside={false}
        onClose={close}
        title="Add Group"
        size="md"
        padding="md"
      >
        <Flex direction="column" gap="xl">
          <GroupForm onClose={close} />
        </Flex>
      </Modal>

      <ActionIcon
        variant="transparent"
        aria-label="Edit project"
        onClick={open}
        size="md"
      >
        <IconPlus />
      </ActionIcon>
    </>
  );
}
