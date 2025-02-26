'use client';

import { Plus } from 'lucide-react';
import { ActionIcon, Drawer, Flex } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import SessionForm from '@/components/Work/Session/SessionForm';
import { useWorkStore } from '@/stores/workManagerStore';
import { TablesInsert } from '@/types/db.types';


export default function NewSessionButton() {
  const [opened, { open, close }] = useDisclosure(false);
  const { activeProject, addTimerSession } = useWorkStore();

  async function handleSubmit(values: {
    start_time: Date;
    active_seconds: number;
    paused_seconds: number;
    currency: string;
    salary: number;
  }) {
    if (!activeProject) {
      return;
    }

    const endTime = new Date(values.start_time.getTime() + (values.active_seconds + values.paused_seconds) * 1000).toISOString();

    const newSession: TablesInsert<"timerSession"> = {
      ...values,
      project_id: activeProject.project.id,
      user_id: activeProject.project.user_id,
      start_time: values.start_time.toISOString(),
      end_time: endTime,
    }

    const success = await addTimerSession(newSession);
    if (success) {
      close();
    }
  }

  return (
    <>
      <Drawer opened={opened} onClose={close} title="Add Session" size="md" padding="md">
        <Flex direction="column" gap="xl">
          <SessionForm
            initialValues={{
              start_time: new Date(),
              active_seconds: 0,
              paused_seconds: 0,
              currency: activeProject?.project.currency || '$',
              salary: activeProject?.project.salary || 0
            }}
            onSubmit={handleSubmit}
            onCancel={close}
            newSession
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