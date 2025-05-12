"use client";

import { Plus } from "lucide-react";
import { ActionIcon, Drawer, Flex, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import FinanceForm from "@/components/Finances/Form/FinanceForm";

export default function NewCashFlowButton() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    < >
      <Modal
        opened={opened}
        onClose={close}
        title="Add Cash Flow"
        size="md"
        padding="md"
      >
        <Flex direction="column" gap="xl">
          <FinanceForm onClose={close} />
        </Flex>
      </Modal>

      <ActionIcon
        variant="transparent"
        aria-label="Edit project"
        onClick={open}
        size="sm"
        color="teal"
      >
        <Plus />
      </ActionIcon>
    </>
  );
}
