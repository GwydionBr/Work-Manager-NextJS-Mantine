'use client';

import { Stack, Center } from '@mantine/core';
import ProjectHeader from '@/components/Work/Project/ProjectHeader';
import SessionList from '@/components/Work/Session/SessionList';
import { useWorkStore } from '@/store/workManagerStore';

export default function WorkPage() {

  const { activeProject } = useWorkStore();

  if (!activeProject) {
    return (
      <Center>
          Please select a project
      </Center>
    );
  }

  return (
    <Stack align="center">
      <ProjectHeader  />
      <SessionList sessions={activeProject.sessions} />
    </Stack>
  );
}
