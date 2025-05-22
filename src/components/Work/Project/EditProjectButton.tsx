"use client";

import { useDisclosure } from "@mantine/hooks";
import { useWorkStore } from "@/stores/workManagerStore";

import { Drawer, Flex } from "@mantine/core";
import DeleteProjectModal from "@/components/Work/Project/DeleteProjectModal";
import ProjectForm from "@/components/Work/Project/ProjectForm";
import EditActionIcon from "@/components/UI/Buttons/EditActionIcon";
import DeleteButton from "@/components/UI/Buttons/DeleteButton";

import { Currency } from "@/types/settings.types";

export default function EditProjectButton() {
  const [opened, { open, close }] = useDisclosure(false);
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const { activeProject, updateProject, deleteProject } = useWorkStore();

  async function handleSubmit(values: {
    title: string;
    description: string;
    salary: number;
    currency: Currency;
  }) {
    if (!activeProject) {
      return;
    }

    const success = await updateProject({
      id: activeProject.project.id,
      ...values,
    });
    if (success) {
      close();
    }
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
    <>
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
            }}
            onSubmit={handleSubmit}
            onCancel={close}
            newProject={false}
          />
          <DeleteButton onClick={openDeleteModal} />
        </Flex>
      </Drawer>

      <DeleteProjectModal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
      />

      <EditActionIcon aria-label="Edit project" onClick={open} size="md" />
    </>
  );
}
