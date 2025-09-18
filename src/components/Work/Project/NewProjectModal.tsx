"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/stores/settingsStore";

import { Modal, useModalsStack } from "@mantine/core";
import ProjectForm from "./ProjectForm";
import FinanceCategoryForm from "@/components/Finances/Form/FinanceCategoryForm";

interface NewProjectModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function NewProjectModal({
  opened,
  onClose,
}: NewProjectModalProps) {
  const { locale } = useSettingsStore();
  const stack = useModalsStack(["project-form", "category-form"]);
  const [categoryId, setCategoryId] = useState<string | null>(null);

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
        title={locale === "de-DE" ? "Neues Projekt" : "New Project"}
      >
        <ProjectForm
          onClose={onClose}
          onCancel={onClose}
          categoryId={categoryId}
          setCategoryId={setCategoryId}
          setActiveProjectId={true}
          onOpenCategoryForm={() => stack.open("category-form")}
        />
      </Modal>
      <Modal
        {...stack.register("category-form")}
        onClose={() => stack.close("category-form")}
        title={locale === "de-DE" ? "Neue Kategorie" : "New Category"}
      >
        <FinanceCategoryForm
          onClose={() => stack.close("category-form")}
          onSuccess={(category) => setCategoryId(category.id)}
        />
      </Modal>
    </Modal.Stack>
  );
}
