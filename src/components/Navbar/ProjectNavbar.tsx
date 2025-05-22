"use client";

import { useWorkStore, type TimerProject } from "@/stores/workManagerStore";

import { Box, Group, ScrollArea, Text } from "@mantine/core";
import NewProjectButton from "../Work/Project/NewProjectButton";

import classes from "./Navbar.module.css";

export default function ProjectNavbar() {
  const { projects, activeProject, setActiveProject } = useWorkStore();

  function handleSelection(timerProject: TimerProject) {
    setActiveProject(timerProject.project.id);
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
        <Text>Projects</Text>
        <NewProjectButton />
      </Group>

      <ScrollArea className={classes.scrollArea}>{links}</ScrollArea>
    </div>
  );
}
