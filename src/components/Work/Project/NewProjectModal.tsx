"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/stores/settingsStore";

import { Modal, useModalsStack } from "@mantine/core";
import ProjectForm from "./ProjectForm";
import FinanceCategoryForm from "@/components/Finances/Category/FinanceCategoryForm";

interface NewProjectModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function NewProjectModal({
  opened,
  onClose,
}: NewProjectModalProps) {
  const { getLocalizedText } = useSettingsStore();
  const stack = useModalsStack(["project-form", "category-form"]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);

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
        size="lg"
        onClose={onClose}
        title={getLocalizedText("Neues Projekt", "New Project")}
      >
        <ProjectForm
          onClose={onClose}
          onCancel={onClose}
          categoryIds={categoryIds}
          setCategoryIds={setCategoryIds}
          setActiveProjectId={true}
          onOpenCategoryForm={() => stack.open("category-form")}
        />
      </Modal>
      <Modal
        {...stack.register("category-form")}
        onClose={() => stack.close("category-form")}
        title={getLocalizedText("Neue Kategorie", "New Category")}
      >
        <FinanceCategoryForm
          onClose={() => stack.close("category-form")}
          onSuccess={(category) =>
            setCategoryIds([...categoryIds, category.id])
          }
        />
      </Modal>
    </Modal.Stack>
  );
}
