"use client";

import { useDisclosure } from "@mantine/hooks";

import { ActionIcon, Flex, Modal } from "@mantine/core";
import { Plus } from "lucide-react";
import FinanceForm from "@/components/Finances/Form/FinanceForm";

export default function NewCashFlowButton() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
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
