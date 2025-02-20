'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTimeTracker } from '@/store/timeTracker';
import paths from '@/paths';

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
      <h1>Work Page</h1>
      <p>Kein Projekt ausgewählt.</p>
    </>
  );
}
