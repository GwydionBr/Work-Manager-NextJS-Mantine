'use client';

import { use, useEffect, useState } from 'react';
import * as actions from '@/actions';
import SessionList from '@/components/Work/SessionList';
import type { Tables } from '@/db.types';

interface ProjectProps {
  params: Promise<{ projectId: string }>;
}

export default function Project({ params }: ProjectProps) {
  const { projectId } = use(params);
  const [sessions, setSessions] = useState<Tables<'timerSession'>[]>([]);

  useEffect(() => {
    (async () => {
      const { data, error, success } = await actions.getSessionByProjectId({ projectId });
      if (!success) {
        console.error(error);
        return;
      }
      setSessions(data);
    })();
  }, [projectId]);

  function onEdit(session: Tables<'timerSession'>) {
    console.log(session);
  }

  function onDelete(session: Tables<'timerSession'>) {
    console.log(session);
  }

  return <SessionList sessions={sessions} onEdit={onEdit} onDelete={onDelete} />;
}
