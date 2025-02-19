'use client';

import React, { useEffect, useState } from 'react';
import ProjectNavbar from '@/components/Navbar/ProjectNavbar';
import * as actions from '@/actions';
import type { Tables } from '@/db.types';

export default function WorkLayout({ children }: { children: any }) {
  const [projects, setProjects] = useState<Tables<'timerProject'>[]>([])

  useEffect(() => {
    actions.getProjects().then((response) => {
      if (!response.success) {
        return null;
      }
  
      setProjects(response.data);
    });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: '100vh' }}>
      <div style={{ width: '250px' }}>
        <ProjectNavbar projects={projects} />
      </div>
      {children}
    </div>
  );
};