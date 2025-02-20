'use client';

import { use, useEffect, useState } from 'react';
import { Group } from '@mantine/core';
import * as actions from '@/actions';
import SessionList from '@/components/Work/SessionList';
import { useTimeTracker } from '@/store/timeTracker';
import type { Tables } from '@/types/db.types';

interface ProjectProps {
  params: Promise<{ projectId: string }>;
}

export default function Project({ params }: ProjectProps) {
  const { projectId } = use(params);
  const [sessions, setSessions] = useState<Tables<'timerSession'>[]>([]);

  const { configureProject } = useTimeTracker();

  useEffect(() => {
    (async () => {
      const { data, error, success } = await actions.getSessionByProjectId({ projectId });
      if (!success) {
        console.error(error);
        return;
      }
      setSessions(data);

      const currentProject = await actions.getProjectById({ id: projectId });
      if (!currentProject.success) {
        console.error(currentProject.error);
        return;
      }
      configureProject(
        projectId,
        currentProject.data.title,
        currentProject.data.currency || '$',
        currentProject.data.salary
      );
    })();
  }, [projectId]);

  return (
    <Group>
      <SessionList sessions={sessions} />
    </Group>
  );
}
