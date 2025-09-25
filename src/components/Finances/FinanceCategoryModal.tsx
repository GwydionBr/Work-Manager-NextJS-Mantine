"use client";

import FinanceCategoryForm from "./FinanceCategoryForm";

import { Tables } from "@/types/db.types";
import { Modal } from "@mantine/core";

interface FinanceCategoryModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: (category: Tables<"finance_category">) => void;
}

export default function FinanceCategoryModal({
  opened,
  onClose,
  onSuccess,
}: FinanceCategoryModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      closeOnClickOutside
      withOverlay
      trapFocus
      returnFocus
    >
      <FinanceCategoryForm onClose={onClose} onSuccess={onSuccess} />
    </Modal>
  );
}
