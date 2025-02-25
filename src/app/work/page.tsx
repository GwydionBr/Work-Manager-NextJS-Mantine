'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTimeTracker } from '@/store/timeTrackerStore';
import paths from '@/utils/paths';

export default function WorkPage() {
  const router = useRouter();
  const { projectId } = useTimeTracker();

  useEffect(() => {
    if (projectId) {
      router.push(paths.work.workDetailsPage(projectId));
    }
  }, [projectId, router]);

  return (
    <>
      <p>Kein Projekt ausgewählt.</p>
    </>
  );
}
