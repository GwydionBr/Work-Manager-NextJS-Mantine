"use client";

import { Plus } from "lucide-react";
import { ActionIcon, Drawer, Flex } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import FinanceForm from "@/components/Finances/FinanceForm";

export default function NewCashFlowButton() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Drawer
        opened={opened}
        onClose={close}
        title="Add Cash Flow"
        size="md"
        padding="md"
      >
        <Flex direction="column" gap="xl">
          <FinanceForm onClose={close} />
        </Flex>
      </Drawer>

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
