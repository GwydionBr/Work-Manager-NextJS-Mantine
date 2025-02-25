'use client';

import { Box, Title } from '@mantine/core';
import { useTimeTracker } from '@/store/timeTrackerStore';
import { useWorkStore, type TimerProject } from '@/store/workManagerStore';
import classes from './Navbar.module.css';


export default function ProjectNavbar() {
  const { projects, activeProject, setActiveProject } = useWorkStore();
  const { configureProject } = useTimeTracker();

  function handleSelection(timerProject: TimerProject) {
    setActiveProject(timerProject.project.id);
    configureProject(
      timerProject.project.id,
      timerProject.project.title,
      timerProject.project.currency,
      timerProject.project.salary
    );
  }

  const links = projects.map((timerProject) => (
    <Box
      className={classes.link}
      data-active={timerProject === activeProject || undefined}
      key={timerProject.project.id}
      onClick={() => handleSelection(timerProject)}
    >
      {timerProject.project.title}
    </Box>
  ));

  return (
    <div className={classes.main}>
      <Title order={4} className={classes.title}>
        Projects
      </Title>

      {links}
    </div>
  );
}