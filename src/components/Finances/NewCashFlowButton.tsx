"use client";

import { useDisclosure } from "@mantine/hooks";

import { Box, Flex, Modal } from "@mantine/core";
import FinanceForm from "@/components/Finances/Form/FinanceForm";
import AddActionIcon from "@/components/UI/ActionIcons/AddActionIcon";

interface NewCashFlowButtonProps {
  isSingle: boolean;
  tooltipLabel?: string;
}

export default function NewCashFlowButton({
  isSingle = true,
  tooltipLabel,
}: NewCashFlowButtonProps) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <Box>
      <Modal
        opened={opened}
        onClose={close}
        title="Add Cash Flow"
        size="md"
        padding="md"
      >
        <Flex direction="column" gap="xl">
          <FinanceForm onClose={close} isSingle={isSingle} />
        </Flex>
      </Modal>

      <AddActionIcon
        aria-label="Add cash flow"
        onClick={open}
        size="md"
        tooltipLabel={tooltipLabel}
      />
    </Box>
  );
}
