'use client';

import { Group, Stack, Text, Title } from '@mantine/core';
import EditProjectButton from '@/components/Work/Project/EditProjectButton';
import { useWorkStore } from '@/store/workManagerStore';
import { formatMoney } from '@/utils/workHelperFunctions';


export default function ProjectHeader() {

  const { activeProject } = useWorkStore();

  if (!activeProject) {
    return null;
  }

  return (
    <Stack align="center">
      <Group align="center">
        <Title order={1}>{activeProject.project.title}</Title>
        <Text>
          {formatMoney(activeProject.project.salary, activeProject.project.currency ?? '$')}
        </Text>
        <EditProjectButton />
      </Group>
      <Text>{activeProject.project.description}</Text>
    </Stack>
  );
}