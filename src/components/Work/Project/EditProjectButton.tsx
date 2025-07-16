"use client";

import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useWorkStore } from "@/stores/workManagerStore";

import { Box, Drawer, Flex, Tooltip } from "@mantine/core";
import ProjectForm from "@/components/Work/Project/ProjectForm";
import EditActionIcon from "@/components/UI/ActionIcons/EditActionIcon";
import DeleteButton from "@/components/UI/Buttons/DeleteButton";
import ConfirmDeleteModal from "@/components/UI/ConfirmDeleteModal";

import { Currency } from "@/types/settings.types";

export default function EditProjectButton() {
  const [opened, { open, close }] = useDisclosure(false);
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const { activeProjectId, updateProject, deleteProject } = useWorkStore();
  const activeProject = useWorkStore((state) =>
    state.projects.find((p) => p.project.id === activeProjectId)
  );
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(values: {
    title: string;
    description: string | null;
    salary: number;
    currency: Currency;
    hourly_payment: boolean;
    cash_flow_category_id?: string | null;
  }) {
    if (!activeProject) {
      return;
    }
    setSubmitting(true);
    const success = await updateProject({
      id: activeProject.project.id,
      ...values,
    });
    if (success) {
      close();
    }
    setSubmitting(false);
  }

  async function handleDelete() {
    if (activeProject) {
      const result = await deleteProject(activeProject.project.id);
      if (result) {
        closeDeleteModal();
        close();
      }
    }
  }

  if (!activeProject) {
    return null;
  }

  return (
    <Box>
      <Drawer
        opened={opened}
        onClose={close}
        title="Edit Project"
        size="md"
        padding="md"
      >
        <Flex direction="column" gap="xl">
          <ProjectForm
            initialValues={{
              title: activeProject.project.title,
              description: activeProject.project.description,
              salary: activeProject.project.salary,
              currency: activeProject.project.currency ?? "",
              hourly_payment: activeProject.project.hourly_payment,
              cash_flow_category_id:
                activeProject.project.cash_flow_category_id,
            }}
            onSubmit={handleSubmit}
            onCancel={close}
            newProject={false}
            submitting={submitting}
          />
          <DeleteButton onClick={openDeleteModal} />
        </Flex>
      </Drawer>

      <ConfirmDeleteModal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
      />

      <EditActionIcon
        aria-label="Edit project"
        onClick={open}
        size="md"
        tooltipLabel="Edit project"
      />
    </Box>
  );
}
