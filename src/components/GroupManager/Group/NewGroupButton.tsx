"use client";

import { useDisclosure } from "@mantine/hooks";

import { Box, Flex, Modal } from "@mantine/core";
import GroupForm from "@/components/GroupManager/Group/GroupForm";
import AddActionIcon from "@/components/UI/ActionIcons/AddActionIcon";

export default function NewGroupButton() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <Box>
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

      <AddActionIcon onClick={open} aria-label="Add group" />
    </Box>
  );
}
