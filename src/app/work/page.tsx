'use client';

import { Center, Stack } from '@mantine/core';
import ProjectHeader from '@/components/Work/Project/ProjectHeader';
import SessionList from '@/components/Work/Session/SessionList';
import { useWorkStore } from '@/stores/workManagerStore';

export default function WorkPage() {
  const { activeProject } = useWorkStore();

  if (!activeProject) {
    return <Center>Please select a project</Center>;
  }

  return (
    <Stack align="center">
      <ProjectHeader />
      <SessionList />
    </Stack>
  );
}
