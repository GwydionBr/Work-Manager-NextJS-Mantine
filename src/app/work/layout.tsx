'use client';

import React, { useEffect, useState } from 'react';
import * as actions from '@/actions';
import ProjectNavbar from '@/components/Navbar/ProjectNavbar';
import type { Tables } from '@/db.types';
import TimeTrackerComponent from '@/components/TimeTracker/TimeTrackerComponent';
import { Grid, Flex } from '@mantine/core';

export default function WorkLayout({ children }: { children: any }) {
  const [projects, setProjects] = useState<Tables<'timerProject'>[]>([]);

  useEffect(() => {
    actions.getProjects().then((response) => {
      if (!response.success) {
        return null;
      }

      setProjects(response.data);
    });
  }, []);

  return (
    <Grid justify="space-between" >
      <Grid.Col span={2}>
        <ProjectNavbar projects={projects} />
      </Grid.Col>
      <Grid.Col span={6}>
        {children}
      </Grid.Col>
      <Grid.Col span={3}>
        <Flex direction='column' justify='center' style={{ height: '100vh', position: 'fixed', right: 0 }}>
          <TimeTrackerComponent />
        </Flex>
      </Grid.Col>
    </Grid>
  );
}
