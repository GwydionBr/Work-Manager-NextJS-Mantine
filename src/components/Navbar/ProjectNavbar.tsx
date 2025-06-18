"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useWorkStore } from "@/stores/workManagerStore";

import {
  Box,
  Divider,
  Group,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";
import NewProjectButton from "../Work/Project/NewProjectButton";
import ProjectTree from "../Work/Project/ProjectTree";
import NewFolderButton from "@/components/Work/Project/NewFolderButton";

import classes from "./Navbar.module.css";

export default function ProjectNavbar() {
  const { isFetching } = useWorkStore();

  const router = useRouter();
  const pathname = usePathname();
  const [isOverview, setIsOverview] = useState<boolean>(false);

  useEffect(() => {
    setIsOverview(pathname === "/work/overview");
  }, [pathname]);

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
        {!isFetching && <NewFolderButton />}
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
          <ProjectTree />
        )}
      </ScrollArea>
    </div>
  );
}
