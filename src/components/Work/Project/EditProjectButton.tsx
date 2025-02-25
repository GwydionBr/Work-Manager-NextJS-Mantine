'use client';

import { IconEdit } from '@tabler/icons-react';
import { ActionIcon, Button, Drawer, NumberInput, Stack, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { Tables } from '@/types/db.types';
import * as actions from '@/actions';


interface EditProjectButtonProps {
  project: Tables<'timerProject'>;
}

export default function EditProjectButton({ project }: EditProjectButtonProps) {
  const [opened, { open, close }] = useDisclosure(false)

  const form = useForm({
    initialValues: {
      title: project.title,
      description: project.description,
      salary: project.salary,
      currency: project.currency ?? '',
    },

    validate: {
      title: (value) => (value.trim().length === 0 ? 'Title is required' : null),
      salary: (value) => (value < 0 ? 'Salary must be positive' : null),
    },
  });

  async function handleSubmit(values: typeof form.values) {
    const newProject = { ...project, ...values };
    const success = await actions.updateProject({ updateProject: newProject });
    if (!success) {
      return;
    }
    close(); 
  };

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