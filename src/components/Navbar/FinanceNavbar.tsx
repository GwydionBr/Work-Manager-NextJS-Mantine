"use client";

import { Box, Group, ScrollArea, Text } from "@mantine/core";
import { useTimeTracker } from "@/stores/timeTrackerStore";
import { useWorkStore, type TimerProject } from "@/stores/workManagerStore";
import NewProjectButton from "../Work/Project/NewProjectButton";
import classes from "./Navbar.module.css";

export default function FinanceNavbar() {
  const { projects, activeProject, setActiveProject } = useWorkStore();
  const { configureProject } = useTimeTracker();

  function handleSelection(timerProject: TimerProject) {
    setActiveProject(timerProject.project.id);
    configureProject(
      timerProject.project.id,
      timerProject.project.title,
      timerProject.project.currency,
      timerProject.project.salary,
      timerProject.project.user_id
    );
  }

  const links = projects.map((timerProject) => (
    <Box
      className={classes.link}
      data-active={
        timerProject.project.id === activeProject?.project.id || undefined
      }
      key={timerProject.project.id}
      onClick={() => handleSelection(timerProject)}
    >
      {timerProject.project.title}
    </Box>
  ));

  return (
    <div className={classes.main}>
      <Group className={classes.title} align="center" justify="space-between">
        <Text>Finance</Text>
        <NewProjectButton />
      </Group>

      <ScrollArea className={classes.scrollArea}>{links}</ScrollArea>
    </div>
  );
}
