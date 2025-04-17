'use client';

import { Group, Stack, Text, Title } from '@mantine/core';
import EditProjectButton from '@/components/Work/Project/EditProjectButton';
import NewSessionButton from '@/components/Work/Session/NewSessionButton';
import { type TimerProject } from '@/stores/workManagerStore';
import { formatMoney } from '@/utils/workHelperFunctions';


interface ProjectHeaderProps {
  project: TimerProject;
}

export default function ProjectHeader({ project }: ProjectHeaderProps) {

  return (
    <Stack align="center">
      <Group align="center">
        <Title order={1}>{project.project.title}</Title>
        <Text>
          {formatMoney(project.project.salary, project.project.currency ?? '$')}
        </Text>
        <EditProjectButton />
      </Group>
      <Text>{project.project.description}</Text>
      <NewSessionButton />
    </Stack>
  );
}