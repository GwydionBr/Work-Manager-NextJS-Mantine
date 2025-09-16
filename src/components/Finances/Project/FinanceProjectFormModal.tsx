"use client";

import { useEffect } from "react";

import { Modal, useModalsStack } from "@mantine/core";
import FinanceProjectForm from "./FinanceProjectForm";
import useSettingsStore from "@/stores/settingsStore";

interface FinanceProjectFormModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function FinanceProjectFormModal({
  opened,
  onClose,
}: FinanceProjectFormModalProps) {
  const stack = useModalsStack(["project-form"]);
  const { locale } = useSettingsStore();

  useEffect(() => {
    if (opened) {
      stack.open("project-form");
    } else {
      stack.closeAll();
    }
  }, [opened]);

  return (
    <Modal.Stack>
      <Modal
        {...stack.register("project-form")}
        onClose={onClose}
        title={
          locale === "de-DE" ? "Neues Finanz Projekt" : "New Finance Project"
        }
        size="lg"
        padding="md"
      >
        <FinanceProjectForm onClose={onClose} />
      </Modal>
    </Modal.Stack>
  );
}
