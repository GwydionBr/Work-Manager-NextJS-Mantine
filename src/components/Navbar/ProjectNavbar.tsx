"use client";

import { useState, useEffect } from "react";
import { useListState } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useWorkStore, type TimerProject } from "@/stores/workManagerStore";

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
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import ProjectTree from "../Work/Project/ProjectTree";

import classes from "./Navbar.module.css";

export default function ProjectNavbar() {
  const { projects, activeProject, isFetching, setActiveProject } =
    useWorkStore();
  const [list, handlers] = useListState(projects);

  const router = useRouter();
  const pathname = usePathname();
  const [isOverview, setIsOverview] = useState<boolean>(false);

  useEffect(() => {
    if (!isFetching && projects.length > 0) {
      handlers.setState(projects);
    }
  }, [isFetching, projects]);

  useEffect(() => {
    setIsOverview(pathname === "/work/overview");
  }, [pathname]);

  function handleSelection(timerProject: TimerProject) {
    setActiveProject(timerProject.project.id);
    router.push("/work");
  }

  const links = list.map((timerProject, index) => (
    <Draggable
      key={timerProject.project.id}
      index={index}
      draggableId={timerProject.project.id}
    >
      {(provided, snapshot) => (
        <Box
          className={classes.link}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          data-active={
            timerProject.project.id === activeProject?.project.id && !isOverview
              ? true
              : undefined
          }
          onClick={() => handleSelection(timerProject)}
        >
          {timerProject.project.title}
        </Box>
      )}
    </Draggable>
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
          // <DragDropContext
          //   onDragEnd={({ destination, source }) =>
          //     handlers.reorder({
          //       from: source.index,
          //       to: destination?.index || 0,
          //     })
          //   }
          // >
          //   <Droppable droppableId="dnd-list" direction="vertical">
          //     {(provided) => (
          //       <div {...provided.droppableProps} ref={provided.innerRef}>
          //         {links}
          //         {provided.placeholder}
          //       </div>
          //     )}
          //   </Droppable>
          // </DragDropContext>
          <ProjectTree />
        )}
      </ScrollArea>
    </div>
  );
}
