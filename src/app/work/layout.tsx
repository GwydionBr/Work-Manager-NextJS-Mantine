'use client';

import { useEffect, useState } from 'react';
import { Flex, Grid } from '@mantine/core';
import * as actions from '@/actions';
import ProjectNavbar from '@/components/Navbar/ProjectNavbar';
import TimeTrackerComponent from '@/components/TimeTracker/TimeTrackerComponent';
import { Tables } from '@/types/db.types';


export default function WorkLayout({ children }: { children: any }) {
  const [projects, setProjects] = useState<Tables<"timerProject">[]>([]);
  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    const { data, success } = await actions.getAllProjects();
    if (!success) {return};
    setProjects(data);
  }
  

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