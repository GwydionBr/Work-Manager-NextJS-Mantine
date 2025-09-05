"use client";

import { useState, useEffect } from "react";
import { useHotkeys } from "@mantine/hooks";
import { useRouter, usePathname } from "next/navigation";
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
import NewProjectButton from "@/components/Work/Project/NewProjectButton";
import ProjectTree from "@/components/Work/Project/ProjectTree";
import NewFolderButton from "@/components/Work/Project/NewFolderButton";
import AdjustmentActionIcon from "@/components/UI/ActionIcons/AdjustmentActionIcon";
import { SettingsTab } from "@/components/Settings/SettingsModal";
import { IconArrowBarRight } from "@tabler/icons-react";
import DelayedTooltip from "@/components/UI/DelayedTooltip";

import classes from "./Navbar.module.css";
import Shortcut from "../UI/Shortcut";

export default function ProjectNavbar() {
  const { isFetching, setActiveProjectId } = useWorkStore();

  const { locale, setSelectedTab, setIsModalOpen, isNavbarOpen, toggleNavbar } =
    useSettingsStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isOverview, setIsOverview] = useState<boolean>(false);

  useEffect(() => {
    setIsOverview(pathname === "/work/overview");
  }, [pathname]);

  useHotkeys([["mod + J", () => toggleNavbar()]]);

  return (
    <Box className={classes.main} w={isNavbarOpen ? 250 : 60}>
      <Group className={classes.title} align="center" justify="space-between">
        <Transition
          mounted={!isNavbarOpen}
          transition="fade"
          duration={200}
          enterDelay={200}
        >
          {(styles) => (
            <DelayedTooltip
              label={
                <Stack align="center">
                  <Text>Toggle Navbar</Text>
                  <Shortcut keys={["mod", "J"]} />
                </Stack>
              }
            >
              <ActionIcon
                onClick={() => toggleNavbar()}
                aria-label="Toggle navbar"
                variant="light"
                style={styles}
              >
                <IconArrowBarRight size={22} />
              </ActionIcon>
            </DelayedTooltip>
          )}
        </Transition>
        <Transition
          mounted={isNavbarOpen}
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
              mounted={isNavbarOpen}
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
              mounted={!isNavbarOpen}
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
        mounted={isNavbarOpen}
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
        mounted={isNavbarOpen}
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
        mounted={isNavbarOpen}
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
        <DelayedTooltip
          label={
            <Stack align="center">
              <Text>Toggle Navbar</Text>
              <Shortcut keys={["mod", "J"]} />
            </Stack>
          }
        >
          <ActionIcon
            onClick={() => toggleNavbar()}
            aria-label="Toggle navbar"
            variant="light"
          >
            <IconArrowBarRight
              size={22}
              style={{
                transform: isNavbarOpen ? "rotate(180deg)" : "none",
                transition: "transform 0.4s linear",
              }}
            />
          </ActionIcon>
        </DelayedTooltip>
      </Group>
    </Box>
  );
}
