'use client';

import { Plus } from 'lucide-react';
import { ActionIcon, Drawer, Flex } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import ProjectForm from '@/components/Work/Project/ProjectForm';
import { useWorkStore } from '@/store/workManagerStore';


export default function NewProjectButton() {
  const [opened, { open, close }] = useDisclosure(false);
  const { addProject } = useWorkStore();

  async function handleSubmit(values: {
    title: string;
    description: string;
    salary: number;
    currency: string;
  }) {

    const success = await addProject({ ...values });
    if (success) {
      close();
    }
  }


  return (
    <>
      <Drawer opened={opened} onClose={close} title="Edit Project" size="md" padding="md">
        <Flex direction="column" gap="xl">
          <ProjectForm
            initialValues={{
              title: '',
              description: '',
              salary: 0,
              currency: '$',
            }}
            onSubmit={handleSubmit}
            onCancel={close}
            existingProject={false}
          />
        </Flex>
      </Drawer>

      <ActionIcon
        variant="transparent"
        aria-label="Edit project"
        onClick={open}
        size="sm"
        color="teal"
      >
        <Plus />
      </ActionIcon>
    </>
  );
}