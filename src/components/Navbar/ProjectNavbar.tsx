"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useWorkStore } from "@/stores/workManagerStore";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  ActionIcon,
  Box,
  Group,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
  Transition,
} from "@mantine/core";
import NewProjectButton from "../Work/Project/NewProjectButton";
import ProjectTree from "../Work/Project/ProjectTree";
import NewFolderButton from "@/components/Work/Project/NewFolderButton";
import AdjustmentActionIcon from "../UI/ActionIcons/AdjustmentActionIcon";

import classes from "./Navbar.module.css";
import { SettingsTab } from "../Settings/SettingsModal";
import { IconArrowBarRight } from "@tabler/icons-react";

export default function ProjectNavbar({
  isNavbarMinimized,
  setIsNavbarMinimized,
}: {
  isNavbarMinimized: boolean;
  setIsNavbarMinimized: (value: boolean) => void;
}) {
  const { isFetching, setActiveProjectId } = useWorkStore();

  const { locale, setSelectedTab, setIsModalOpen } = useSettingsStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isOverview, setIsOverview] = useState<boolean>(false);

  useEffect(() => {
    setIsOverview(pathname === "/work/overview");
  }, [pathname]);

  return (
    <Box className={classes.main} w={isNavbarMinimized ? 60 : 250}>
      <Group className={classes.title} align="center" justify="space-between">
        <Transition
          mounted={isNavbarMinimized}
          transition="fade"
          duration={200}
          enterDelay={200}
        >
          {(styles) => (
            <ActionIcon
              onClick={() => setIsNavbarMinimized(!isNavbarMinimized)}
              aria-label="Toggle aside"
              variant="light"
              style={styles}
            >
              <IconArrowBarRight size={22} />
            </ActionIcon>
          )}
        </Transition>
        <Transition
          mounted={!isNavbarMinimized}
          transition="fade"
          duration={200}
          enterDelay={200}
        >
          {(styles) => (
            <Text style={styles}>
              {locale === "de-DE" ? "Projekte" : "Projects"}
            </Text>
          )}
        </Transition>
        {!isFetching && (
          <>
            <Transition
              mounted={!isNavbarMinimized}
              transition="fade"
              duration={200}
              enterDelay={200}
            >
              {(styles) => (
                <Group gap={8} style={styles}>
                  <AdjustmentActionIcon
                    aria-label="Adjust project settings"
                    tooltipLabel={
                      locale === "de-DE"
                        ? "Projekteinstellungen anpassen"
                        : "Adjust project settings"
                    }
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
            </Transition>
            <Transition
              mounted={isNavbarMinimized}
              transition="fade"
              duration={200}
              enterDelay={200}
            >
              {(styles) => (
                <Stack gap={8} style={styles} align="center" mt={10}>
                  <NewProjectButton />
                  <AdjustmentActionIcon
                    aria-label="Adjust project settings"
                    tooltipLabel={
                      locale === "de-DE"
                        ? "Projekteinstellungen anpassen"
                        : "Adjust project settings"
                    }
                    size="md"
                    iconSize={20}
                    onClick={() => {
                      setIsModalOpen(true);
                      setSelectedTab(SettingsTab.WORK);
                    }}
                  />
                </Stack>
              )}
            </Transition>
          </>
        )}
      </Group>

      <Transition
        mounted={!isNavbarMinimized}
        transition="fade"
        duration={200}
        enterDelay={200}
      >
        {(styles) => (
          <Box
            className={classes.overviewLink}
            data-active={isOverview ? true : undefined}
            style={styles}
            onClick={() => {
              if (!isFetching) {
                router.push("/work/overview");
                setActiveProjectId(null);
              }
            }}
          >
            {locale === "de-DE" ? "Übersicht" : "Overview"}
          </Box>
        )}
      </Transition>
      <Transition
        mounted={!isNavbarMinimized}
        transition="fade"
        duration={200}
        enterDelay={200}
      >
        {(styles) => (
          <Group
            className={classes.projectCategoriesRow}
            justify="flex-end"
            align="center"
            gap={10}
            px={10}
            style={styles}
          >
            {!isFetching && <NewProjectButton plusIcon={false} />}
            {!isFetching && <NewFolderButton />}
          </Group>
        )}
      </Transition>

      <Transition
        mounted={!isNavbarMinimized}
        transition="fade"
        duration={200}
        enterDelay={200}
      >
        {(styles) => (
          <ScrollArea h="100%" w="100%" style={styles}>
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
        )}
      </Transition>
      <Group
        justify="flex-end"
        p={5}
        pr={15}
        align="center"
        w="100%"
        bg="var(--mantine-color-body)"
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          zIndex: 1000,
          borderTop:
            "1px solid light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-7))",
        }}
      >
        <ActionIcon
          onClick={() => setIsNavbarMinimized(!isNavbarMinimized)}
          aria-label="Toggle aside"
          variant="light"
        >
          <IconArrowBarRight
            size={22}
            style={{
              transform: isNavbarMinimized ? "none" : "rotate(180deg)",
              transition: "transform 0.4s linear",
            }}
          />
        </ActionIcon>
      </Group>
    </Box>
  );
}
