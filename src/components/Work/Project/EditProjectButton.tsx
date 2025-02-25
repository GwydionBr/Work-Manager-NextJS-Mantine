'use client';

import { useEffect } from 'react';
import { IconEdit } from '@tabler/icons-react';
import { ActionIcon, Button, Drawer, Flex, Modal, NumberInput, Stack, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { useWorkStore } from '@/store/workManagerStore';


export default function EditProjectButton() {
  const [opened, { open, close }] = useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] =
    useDisclosure(false);
  const { activeProject, updateProject, deleteProject } = useWorkStore();

  const form = useForm({
    initialValues: {
      title: '',
      description: '',
      salary: 0,
      currency: '',
    },
    validate: {
      title: (value) => (value.trim().length === 0 ? 'Title is required' : null),
      salary: (value) => (value < 0 ? 'Salary must be positive' : null),
    },
  });

  useEffect(() => {
    if (activeProject) {
      form.setValues({
        title: activeProject.project.title,
        description: activeProject.project.description,
        salary: activeProject.project.salary,
        currency: activeProject.project.currency ?? '',
      });
      form.resetDirty();
    }
  }, [activeProject]);

  async function handleSubmit(values: {
    title: string;
    description: string;
    salary: number;
    currency: string;
  }) {
    if (!activeProject) { 
      return;
    }
    const newProject = { id: activeProject.project.id, ...values };
    const success = await updateProject(newProject);
    if (!success) {
      return;
    }
    close();
  }

  async function handleDelete() {
    if (activeProject) {
      const result = await deleteProject(activeProject.project.id);
      if (!result) {
        closeDeleteModal();
        return;
      }
      closeDeleteModal();
      close();
    }
  }

  if (!activeProject) {
    return null;
  }

  return (
    <>
      <Drawer opened={opened} onClose={close} title="Edit Project" size="md" padding="md">
        <Flex direction="column" gap="xl">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <TextInput
                label="Title"
                placeholder="Enter project title"
                {...form.getInputProps('title')}
              />
              <Textarea
                label="Description"
                placeholder="Enter project description"
                {...form.getInputProps('description')}
              />
              <NumberInput label="Salary" min={0} step={0.01} {...form.getInputProps('salary')} />
              <TextInput
                label="Currency"
                placeholder="USD, EUR, etc."
                {...form.getInputProps('currency')}
              />
              <Button type="submit">Save Changes</Button>
              <Button onClick={close} color="red" variant="outline">
                Cancel
              </Button>
            </Stack>
          </form>
          <Button color="red" variant="filled" onClick={openDeleteModal}>
            Delete
          </Button>
        </Flex>
      </Drawer>

      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title="Projekt löschen?"
        centered
      >
        <p>Dieses Projekt kann nicht wiederhergestellt werden. Möchtest du es wirklich löschen?</p>
        <Flex mt="md" justify="flex-end" gap="sm">
          <Button onClick={closeDeleteModal} variant="outline">
            Abbrechen
          </Button>
          <Button onClick={handleDelete} color="red">
            Ja, löschen
          </Button>
        </Flex>
      </Modal>

      <ActionIcon aria-label="Edit project" onClick={open} size="sm">
        <IconEdit />
      </ActionIcon>
    </>
  );
}