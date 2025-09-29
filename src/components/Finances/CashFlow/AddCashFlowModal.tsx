"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/stores/settingsStore";

import { Group, Modal, Text, useModalsStack } from "@mantine/core";
import CashflowForm from "@/components/Finances/CashFlow/CashflowForm";
import FinanceCategoryForm from "@/components/Finances/Category/FinanceCategoryForm";
import { IconCashPlus, IconCategoryPlus } from "@tabler/icons-react";

interface CashFlowModalProps {
  opened: boolean;
  onClose: () => void;
  isSingle?: boolean;
}

export default function CashFlowModal({
  opened,
  onClose,
  isSingle = true,
}: CashFlowModalProps) {
  const modalStack = useModalsStack(["cash-flow", "category-form"]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const { locale } = useSettingsStore();
  useEffect(() => {
    if (opened) {
      modalStack.open("cash-flow");
    } else {
      modalStack.closeAll();
    }
  }, [opened]);

  return (
    <Modal.Stack>
      <Modal
        {...modalStack.register("cash-flow")}
        onClose={onClose}
        title={
          <Group>
            <IconCashPlus />
            <Text>
              {locale === "de-DE" ? "Zahlung hinzufügen" : "Add Cash Flow"}
            </Text>
          </Group>
        }
      >
        <CashflowForm
          onClose={onClose}
          onOpenCategoryForm={() => modalStack.open("category-form")}
          categoryIds={categoryIds}
          setCategoryIds={setCategoryIds}
          isSingle={isSingle}
        />
      </Modal>
      <Modal
        {...modalStack.register("category-form")}
        onClose={() => modalStack.close("category-form")}
        title={
          <Group>
            <IconCategoryPlus />
            <Text>
              {locale === "de-DE" ? "Kategorie hinzufügen" : "Add Category"}
            </Text>
          </Group>
        }
      >
        <FinanceCategoryForm
          onClose={() => modalStack.close("category-form")}
          onSuccess={(category) =>
            setCategoryIds((prev) => [...prev, category.id])
          }
        />
      </Modal>
    </Modal.Stack>
  );
}
