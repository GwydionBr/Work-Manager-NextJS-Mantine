"use client";

import { useDisclosure } from "@mantine/hooks";
import { useSettingsStore } from "@/stores/settingsStore";

import { Box, Flex, Modal } from "@mantine/core";
import FinanceForm from "@/components/Finances/Form/FinanceForm";
import AddActionIcon from "@/components/UI/ActionIcons/PlusActionIcon";

interface NewCashFlowButtonProps {
  isSingle?: boolean;
  tooltipLabel?: string;
}

export default function NewCashFlowButton({
  isSingle = true,
  tooltipLabel,
}: NewCashFlowButtonProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const { locale } = useSettingsStore();
  return (
    <Box>
      <Modal
        opened={opened}
        onClose={close}
        title={locale === "de-DE" ? "Cashflow hinzufügen" : "Add Cash Flow"}
        size="md"
        padding="md"
      >
        <Flex direction="column" gap="xl">
          <FinanceForm onClose={close} isSingle={isSingle} />
        </Flex>
      </Modal>

      <AddActionIcon
        aria-label={
          locale === "de-DE" ? "Cashflow hinzufügen" : "Add cash flow"
        }
        onClick={open}
        size="md"
        tooltipLabel={
          tooltipLabel ||
          (locale === "de-DE" ? "Cashflow hinzufügen" : "Add cash flow")
        }
      />
    </Box>
  );
}
