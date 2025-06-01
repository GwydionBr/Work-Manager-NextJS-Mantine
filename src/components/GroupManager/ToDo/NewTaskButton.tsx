"use client";

import { useDisclosure } from "@mantine/hooks";

import { Button, Flex, Modal } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import TaskForm from "@/components/GroupManager/ToDo/Form/TaskForm";

export default function NewTaskButton() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title="Add Task"
        size="md"
        padding="md"
      >
        <Flex direction="column" gap="xl">
          <TaskForm onClose={close} />
        </Flex>
      </Modal>

      <Button onClick={open} w={200} leftSection={<IconPlus />}>
        Add Task
      </Button>
    </>
  );
}
