"use client";

import { useEffect, useState } from "react";
import { useFormatter } from "@/hooks/useFormatter";
import { useRouter } from "next/navigation";

import { Modal, useModalsStack } from "@mantine/core";
import ProjectForm from "./ProjectForm";
import FinanceCategoryForm from "@/components/Finances/Category/FinanceCategoryForm";

import paths from "@/utils/paths";
import { Tables } from "@/types/db.types";

interface NewProjectModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function NewProjectModal({
  opened,
  onClose,
}: NewProjectModalProps) {
  const router = useRouter();
  const { getLocalizedText } = useFormatter();
  const stack = useModalsStack(["project-form", "category-form"]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);

  useEffect(() => {
    if (opened) {
      stack.open("project-form");
    } else {
      stack.closeAll();
    }
  }, [opened]);

  const handleSuccess = (project: Tables<"timer_project">) => {
    onClose();
    setCategoryIds([]);
    router.push(paths.work.workDetailsPage(project.id));
  };

  return (
    <Modal.Stack>
      <Modal
        {...stack.register("project-form")}
        size="lg"
        onClose={onClose}
        title={getLocalizedText("Neues Projekt", "New Project")}
      >
        <ProjectForm
          onCancel={onClose}
          onSuccess={handleSuccess}
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
