"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useWorkStore } from "@/stores/workManagerStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Box, Group, ScrollArea, Skeleton, Stack, Text } from "@mantine/core";
import NewProjectButton from "../Work/Project/NewProjectButton";
import ProjectTree from "../Work/Project/ProjectTree";
import NewFolderButton from "@/components/Work/Project/NewFolderButton";
import AdjustmentActionIcon from "../UI/ActionIcons/AdjustmentActionIcon";

import classes from "./Navbar.module.css";
import { SettingsTab } from "../Settings/SettingsModal";

export default function ProjectNavbar() {
  const { isFetching } = useWorkStore();
  const { setSelectedTab, setIsModalOpen } = useSettingsStore();

  const router = useRouter();
  const pathname = usePathname();
  const [isOverview, setIsOverview] = useState<boolean>(false);

  useEffect(() => {
    setIsOverview(pathname === "/work/overview");
  }, [pathname]);

  return (
    <Box className={classes.main}>
      <Group className={classes.title} align="center" justify="space-between">
        <Text>Projects</Text>
        {!isFetching && (
          <Group gap={8}>
            <AdjustmentActionIcon
              aria-label="Adjust project settings"
              tooltipLabel="Adjust project settings"
              size="md"
              iconSize={20}
              onClick={() => {
                setIsModalOpen(true);
                setSelectedTab(SettingsTab.WORK);
              }}
            />
            <NewProjectButton />
          </Group>
        )}
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
      <Group
        className={classes.projectCategoriesRow}
        justify="flex-end"
        align="center"
        gap={10}
        px={10}
      >
        {!isFetching && <NewProjectButton plusIcon={false} />}
        {!isFetching && <NewFolderButton />}
      </Group>

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
    </Box>
  );
}
