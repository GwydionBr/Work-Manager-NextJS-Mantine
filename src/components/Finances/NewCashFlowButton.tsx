"use client";

import { useDisclosure } from "@mantine/hooks";

import { Flex, Modal } from "@mantine/core";
import FinanceForm from "@/components/Finances/Form/FinanceForm";
import AddActionIcon from "@/components/UI/Buttons/AddActionIcon";
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

      <AddActionIcon
        aria-label="Add cash flow"
        onClick={open}
        size="md"
      />
    </>
  );
}
