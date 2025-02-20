'use client';

import { use, useEffect, useState } from 'react';
import * as actions from '@/actions';
import SessionList from '@/components/Work/SessionList';
import type { Tables } from '@/db.types';
import TimeTrackerComponent from '@/components/TimeTracker/TimeTracker';
import { Group } from '@mantine/core';

interface ProjectProps {
  params: Promise<{ projectId: string }>;
}

export default function Project({ params }: ProjectProps) {
  const { projectId } = use(params);
  const [sessions, setSessions] = useState<Tables<'timerSession'>[]>([]);
  const [project, setProject] = useState<Tables<'timerProject'> | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error, success } = await actions.getSessionByProjectId({ projectId });
      if (!success) {
        console.error(error);
        return;
      }
      setSessions(data);

      const project = await actions.getProjectById({ id: projectId });
      if (!project.success) {
        console.error(project.error);
        return;
      }
      setProject(project.data);
      console.log(project.data);

    })();
  }, [projectId]);

  function onEdit(session: Tables<'timerSession'>) {
    console.log(session);
  }

  function onDelete(session: Tables<'timerSession'>) {
    console.log(session);
  }

  return (
    <Group>
      <SessionList sessions={sessions} onEdit={onEdit} onDelete={onDelete} />
      <TimeTrackerComponent project={project}/>
    </Group>
  )
}
