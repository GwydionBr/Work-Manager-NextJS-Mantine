'use client';

import { Group, Stack, Text, Title } from '@mantine/core';
import EditProjectButton from '@/components/Work/Project/EditProjectButton';
import { Tables } from '@/types/db.types';
import { formatMoney } from '@/utils/workHelperFunctions';


interface ProjectHeaderProps {
  project: Tables<'timerProject'> | null;
}

export default function ProjectHeader({ project }: ProjectHeaderProps) {

  if (!project) {
    return null;
  }

  return (
    <Stack align="center">
      <Group align="center">
        <Title order={1}>{project.title}</Title>
        <Text>{formatMoney(project.salary, project.currency ?? '$')}</Text>
        <EditProjectButton project={project}/>
      </Group>
      <Text>{project.description}</Text>
    </Stack>
  );
}