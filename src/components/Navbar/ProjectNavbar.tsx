"use client";

import { useState, useEffect } from "react";
import { useWorkStore, type TimerProject } from "@/stores/workManagerStore";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

import {
  Box,
  ActionIcon,
  Divider,
  Group,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";
import { IconCategoryPlus } from "@tabler/icons-react";
import NewProjectButton from "../Work/Project/NewProjectButton";

import classes from "./Navbar.module.css";

export default function ProjectNavbar() {
  const { projects, activeProject, isFetching, setActiveProject } =
    useWorkStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isOverview, setIsOverview] = useState<boolean>(false);

  useEffect(() => {
    setIsOverview(pathname === "/work/overview");
  }, [pathname]);

  function handleSelection(timerProject: TimerProject) {
    setActiveProject(timerProject.project.id);
    router.push("/work");
  }

  const links = projects.map((timerProject) => (
    <Box
      className={classes.link}
      data-active={
        timerProject.project.id === activeProject?.project.id && !isOverview
          ? true
          : undefined
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
        {!isFetching && <NewProjectButton />}
      </Group>

      <Box
        className={classes.overviewLink}
        data-active={isOverview ? true : undefined}
        onClick={() => {
          if (!isFetching) {
            router.push("/work/overview");
          }
        }}
      >
        Overview
      </Box>
      <Divider />
      <Group className={classes.projectCategoriesRow} justify="space-around">
        <Text size="xs">Categories</Text>
        <ActionIcon variant="subtle" size="sm">
          <IconCategoryPlus />
        </ActionIcon>
      </Group>
      <Divider />

      <ScrollArea className={classes.scrollArea}>
        {isFetching ? (
          <Stack pt="md">
            <Skeleton height={25} w={160} mx="md" />
            <Skeleton height={25} w={160} mx="md" />
            <Skeleton height={25} w={160} mx="md" />
          </Stack>
        ) : (
          links
        )}
      </ScrollArea>
    </div>
  );
}
