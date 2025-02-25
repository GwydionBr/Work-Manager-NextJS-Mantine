'use client';

import { use, useEffect, useState } from 'react';
import { Stack } from '@mantine/core';
import * as actions from '@/actions';
import ProjectHeader from '@/components/Work/Project/ProjectHeader';
import SessionList from '@/components/Work/Session/SessionList';
import { Tables } from '@/types/db.types';


interface ProjectProps {
  params: Promise<{ projectId: string }>;
}

export default function Project({ params }: ProjectProps) {
  const { projectId } = use(params);
  const [sessions, setSessions] = useState<Tables<"timerSession">[]>([]);
  const [project, setProject] = useState<Tables<'timerProject'> | null>(null);

  useEffect(() => {
      fetchData();
    }, []);

    async function fetchData() {
      const sessionsResponse = await actions.getProjectSessions({ projectId });
      if (sessionsResponse.success) {
        setSessions(sessionsResponse.data);
      }

      const projectResponse = await actions.getProjectById({ id: projectId });
      if (projectResponse.success) {
        setProject(projectResponse.data);
      }
    }

  return (
    <Stack align="center">
      <ProjectHeader project={project}  />
      <SessionList sessions={sessions} />
    </Stack>
  );
}