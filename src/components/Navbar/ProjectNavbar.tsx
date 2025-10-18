"use client";

import { useState, useEffect } from "react";
import { useHotkeys, useDisclosure } from "@mantine/hooks";
import { useRouter, usePathname } from "next/navigation";
import { useWorkStore } from "@/stores/workManagerStore";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  ActionIcon,
  Box,
  Divider,
  Group,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Transition,
} from "@mantine/core";
import NewProjectModal from "@/components/Work/Project/NewProjectModal";
import ProjectTree from "@/components/Work/Project/ProjectTree";
import NewFolderButton from "@/components/Work/Project/NewFolderButton";
import AdjustmentActionIcon from "@/components/UI/ActionIcons/AdjustmentActionIcon";
import { SettingsTab } from "@/components/Settings/SettingsModal";
import {
  IconArrowBarRight,
  IconFilePlus,
  IconSearch,
} from "@tabler/icons-react";
import DelayedTooltip from "@/components/UI/DelayedTooltip";

import classes from "./Navbar.module.css";
import Shortcut from "../UI/Shortcut";
import PlusActionIcon from "../UI/ActionIcons/PlusActionIcon";
import { useWorkProjectQuery } from "@/utils/queries/work/use-work-project";
import XActionIcon from "../UI/ActionIcons/XActionIcon";

export default function ProjectNavbar() {
  const { setActiveProjectId } = useWorkStore();
  const { isPending: isProjectsPending } = useWorkProjectQuery();

  const {
    locale,
    getLocalizedText,
    setSelectedTab,
    setIsModalOpen,
    isWorkNavbarOpen,
    toggleWorkNavbar,
  } = useSettingsStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isOverview, setIsOverview] = useState<boolean>(false);
  const [seachTree, setSeachTree] = useState<string>("");
  const [
    isProjectModalOpen,
    { open: openProjectModal, close: closeProjectModal },
  ] = useDisclosure(false);
  useEffect(() => {
    setIsOverview(pathname === "/work/overview");
  }, [pathname]);

  useHotkeys([["mod + J", () => toggleWorkNavbar()]]);

  return (
    <Box className={classes.main} w={isWorkNavbarOpen ? 250 : 60}>
      <Group className={classes.title} align="center" justify="space-between">
        <Transition
          mounted={!isWorkNavbarOpen}
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
                onClick={() => toggleWorkNavbar()}
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
          mounted={isWorkNavbarOpen}
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
        {!isProjectsPending && (
          <>
            <Transition
              mounted={isWorkNavbarOpen}
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
                  <PlusActionIcon
                    onClick={openProjectModal}
                    tooltipLabel={
                      locale === "de-DE" ? "Neues Projekt" : "New Project"
                    }
                  />
                </Group>
              )}
            </Transition>
            <Transition
              mounted={!isWorkNavbarOpen}
              transition="fade"
              duration={200}
              enterDelay={200}
            >
              {(styles) => (
                <Stack gap={8} style={styles} align="center" mt={10}>
                  <PlusActionIcon
                    onClick={openProjectModal}
                    tooltipLabel={
                      locale === "de-DE" ? "Neues Projekt" : "New Project"
                    }
                  />
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
        mounted={isWorkNavbarOpen}
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
              if (!isProjectsPending) {
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
        mounted={isWorkNavbarOpen}
        transition="fade"
        duration={200}
        enterDelay={200}
      >
        {(styles) => (
          <Group wrap="nowrap" gap={5} align="center" style={styles}>
            <TextInput
              w="100%"
              styles={{
                input: {
                  borderRadius: "var(--mantine-radius-md)",
                  backgroundColor: "var(--mantine-color-body)",
                  border:
                    "1px solid light-dark(var(--mantine-color-gray-6), var(--mantine-color-dark-2))",
                },
              }}
              p={5}
              radius={10}
              leftSection={<IconSearch size={16} />}
              rightSection={
                seachTree && (
                  <XActionIcon
                    onClick={() => setSeachTree("")}
                    tooltipLabel={getLocalizedText(
                      "Projekt Suche löschen",
                      "Clear Project search"
                    )}
                    iconSize={16}
                    variant="transparent"
                    iconColor="var(--mantine-color-gray-6)"
                  />
                )
              }
              placeholder={getLocalizedText("Suche Projekt", "Search Project")}
              aria-label={getLocalizedText("Suche Projekt", "Search Project")}
              value={seachTree}
              onChange={(e) => setSeachTree(e.target.value)}
            />
            {!isProjectsPending && (
              <Group
                h={35}
                wrap="nowrap"
                bg="var(--mantine-color-body)"
                gap={0}
                mr={5}
                style={{
                  borderRadius: "var(--mantine-radius-md)",
                  border:
                    "1px solid light-dark(var(--mantine-color-gray-6), var(--mantine-color-dark-2))",
                }}
              >
                <DelayedTooltip
                  label={locale === "de-DE" ? "Neues Projekt" : "New Project"}
                >
                  <ActionIcon
                    h={35}
                    onClick={openProjectModal}
                    variant="subtle"
                  >
                    <IconFilePlus size={20} />
                  </ActionIcon>
                </DelayedTooltip>
                <Divider orientation="vertical" />
                <NewFolderButton h={35} />
              </Group>
            )}
          </Group>
        )}
      </Transition>

      <Transition
        mounted={isWorkNavbarOpen}
        transition="fade"
        duration={200}
        enterDelay={200}
      >
        {(styles) => (
          <ScrollArea h="100%" w="100%" style={styles}>
            <ProjectTree search={seachTree} />
            {/* <NewProjectTree /> */}
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
            onClick={() => toggleWorkNavbar()}
            aria-label="Toggle navbar"
            variant="light"
          >
            <IconArrowBarRight
              size={22}
              style={{
                transform: isWorkNavbarOpen ? "rotate(180deg)" : "none",
                transition: "transform 0.4s linear",
              }}
            />
          </ActionIcon>
        </DelayedTooltip>
      </Group>
      <NewProjectModal
        opened={isProjectModalOpen}
        onClose={closeProjectModal}
      />
    </Box>
  );
}
