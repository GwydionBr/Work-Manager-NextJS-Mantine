'use client';

import { use, useEffect } from 'react';
import { Stack } from '@mantine/core';
import ProjectHeader from '@/components/Work/Project/ProjectHeader';
import SessionList from '@/components/Work/Session/SessionList';
import { useWorkStore } from '@/store/workManagerStore';


interface ProjectProps {
  params: Promise<{ projectId: string }>;
}

export default function Project({ params }: ProjectProps) {
  const { projectId } = use(params);
  const { activeProject, setActiveProject } = useWorkStore();

  useEffect(() => {
    setActiveProject(projectId);
    }, [projectId]);

    if (!activeProject) {
      return null;
    }

  return (
    <Stack align="center">
      <ProjectHeader  />
      <SessionList sessions={activeProject.sessions} />
    </Stack>
  );
}