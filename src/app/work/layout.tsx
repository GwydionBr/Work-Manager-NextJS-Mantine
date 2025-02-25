'use client';

import { useEffect } from 'react';
import { Flex, Grid } from '@mantine/core';
import ProjectNavbar from '@/components/Navbar/ProjectNavbar';
import TimeTrackerComponent from '@/components/TimeTracker/TimeTrackerComponent';
import { useWorkStore } from '@/store/workManagerStore';


export default function WorkLayout({ children }: { children: React.ReactNode }) {
  
  const { projects, fetchProjects } = useWorkStore();

  useEffect(() => {
    fetchProjects();
  }, []);


  return (
    <Grid justify="space-between">
      <Grid.Col span={2}>
        <ProjectNavbar projects={projects} />
      </Grid.Col>
      <Grid.Col span={6} p={40}>
        <Flex justify="center">
          {children}
        </Flex>
      </Grid.Col>
      <Grid.Col span={3}>
        <Flex
          direction="column"
          justify="center"
          style={{ height: '100vh', position: 'fixed', right: 20 }}
        >
          <TimeTrackerComponent />
        </Flex>
      </Grid.Col>
    </Grid>
  );
}