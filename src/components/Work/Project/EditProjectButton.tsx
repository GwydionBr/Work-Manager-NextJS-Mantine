'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { ActionIcon, Button, Drawer, Flex } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useWorkStore } from '@/store/workManagerStore';
import DeleteProjectModal from '@/components/Work/Project/deleteProjectModal';
import ProjectForm from '@/components/Work/Project/ProjectForm';

export default function EditProjectButton() {
  const [opened, { open, close }] = useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] =
    useDisclosure(false);
  const { activeProject, updateProject, deleteProject } = useWorkStore();

  async function handleSubmit(values: {
    title: string;
    description: string;
    salary: number;
    currency: string;
  }) {
    if (!activeProject) {return};

    const success = await updateProject({ id: activeProject.project.id, ...values });
    if (success) {close()};
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

  if (!activeProject) {return null};

  return (
    <>
      <Drawer opened={opened} onClose={close} title="Edit Project" size="md" padding="md">
        <Flex direction="column" gap="xl">
          <ProjectForm
            initialValues={{
              title: activeProject.project.title,
              description: activeProject.project.description,
              salary: activeProject.project.salary,
              currency: activeProject.project.currency ?? '',
            }}
            onSubmit={handleSubmit}
            onCancel={close}
            existingProject
          />
          <Button
            leftSection={<Trash2 size={18} />}
            color="red"
            variant="filled"
            onClick={openDeleteModal}
          >
            Delete
          </Button>
        </Flex>
      </Drawer>

      <DeleteProjectModal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
      />

      <ActionIcon
        variant="transparent"
        aria-label="Edit project"
        onClick={open}
        size="sm"
        color="teal"
      >
        <Pencil />
      </ActionIcon>
    </>
  );
}
