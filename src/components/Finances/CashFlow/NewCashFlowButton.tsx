"use client";

import { useDisclosure } from "@mantine/hooks";
import { useSettingsStore } from "@/stores/settingsStore";

import { ActionIcon, Box, Flex, Modal } from "@mantine/core";
import FinanceForm from "@/components/Finances/Form/FinanceForm";
import { IconCashPlus } from "@tabler/icons-react";
import DelayedTooltip from "../../UI/DelayedTooltip";

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
          <FinanceForm
            onClose={close}
            isSingle={isSingle}
            onOpenCategoryForm={() => {}}
            categoryId={null}
            setCategoryId={() => {}}
          />
        </Flex>
      </Modal>
      <DelayedTooltip
        label={
          tooltipLabel ||
          (locale === "de-DE" ? "Cashflow hinzufügen" : "Add cash flow")
        }
      >
        <ActionIcon
          onClick={open}
          size="md"
          variant="subtle"
          aria-label={
            tooltipLabel ||
            (locale === "de-DE" ? "Cashflow hinzufügen" : "Add cash flow")
          }
        >
          <IconCashPlus />
        </ActionIcon>
      </DelayedTooltip>
    </Box>
  );
}
