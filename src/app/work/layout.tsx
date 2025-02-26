'use client';

import { useEffect } from 'react';
import { Flex, Grid } from '@mantine/core';
import ProjectNavbar from '@/components/Navbar/ProjectNavbar';
import TimeTrackerComponent from '@/components/TimeTracker/TimeTrackerComponent';
import { useWorkStore } from '@/stores/workManagerStore';

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  const { fetchData } = useWorkStore();

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Grid justify="space-between">
      <Grid.Col span={2}>
        <ProjectNavbar />
      </Grid.Col>
      <Grid.Col span={6} p={40}>
        <Flex justify="center">{children}</Flex>
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
