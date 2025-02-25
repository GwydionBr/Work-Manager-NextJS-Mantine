'use client';

import { useEffect } from 'react';
import { IconEdit } from '@tabler/icons-react';
import { ActionIcon, Button, Drawer, NumberInput, Stack, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { useWorkStore } from '@/store/workManagerStore';

export default function EditProjectButton() {
  const [opened, { open, close }] = useDisclosure(false);
  const { activeProject, updateProject } = useWorkStore();

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

  // Effekt, um die Formularwerte zu aktualisieren, wenn sich activeProject ändert
  useEffect(() => {
    if (activeProject) {
      form.setValues({
        title: activeProject.project.title,
        description: activeProject.project.description,
        salary: activeProject.project.salary,
        currency: activeProject.project.currency ?? '',
      });
      form.resetDirty(); // Setzt den Dirty-Status des Formulars zurück
    }
  }, [activeProject]);

  async function handleSubmit(values: { title: string; description: string; salary: number; currency: string }) {
    if (!activeProject) {
      return;
    }
    const newProject = { id: activeProject.project.id, ...values };
    const success = updateProject(newProject);
    if (!success) {
      return;
    }
    close();
  }

  if (!activeProject) {
    return null;
  }

  return (
    <>
      <Drawer opened={opened} onClose={close} title="Edit Project" size="md" padding="md">
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
          </Stack>
        </form>
      </Drawer>

      <ActionIcon aria-label="Edit project" onClick={open} size="sm">
        <IconEdit />
      </ActionIcon>
    </>
  );
}
