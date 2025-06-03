"use client";

import { useState } from "react";

import {
  ActionIcon,
  Collapse,
  Divider,
  Group,
  Stack,
  Transition,
} from "@mantine/core";
import { IconArrowBarLeft } from "@tabler/icons-react";
import NotificationAside from "../Notification/NotificationAside";
import TimeTrackerComponent from "../TimeTracker/TimeTrackerComponent";
import CalendarAside from "../Calendar/CalendarAside/CalendarAside";

import classes from "./AppShell.module.css";

interface AsideProps {
  toggleAside: () => void;
  isAsideOpen: boolean;
}

export default function Aside({ toggleAside, isAsideOpen }: AsideProps) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(true);
  const [isTimeTrackerMinimized, setIsTimeTrackerMinimized] = useState(false);

  return (
    <Stack py="md" h="100%" align="center">
      <Stack align="flex-start" w="100%" gap="lg">
        <Group pl="xs" justify="flex-start">
          <ActionIcon
            onClick={toggleAside}
            aria-label="Toggle aside"
            variant="transparent"
          >
            <IconArrowBarLeft
              className={classes.icon}
              style={{ transform: isAsideOpen ? "rotate(180deg)" : "none" }}
            />
          </ActionIcon>
        </Group>
        <Group pl="xs">
          <NotificationAside
            isNotificationOpen={isNotificationOpen}
            asideOpened={isAsideOpen}
            setIsNotificationOpen={setIsNotificationOpen}
          />
        </Group>
      </Stack>
      <Transition
        mounted={isAsideOpen}
        transition="fade"
        duration={200}
        enterDelay={200}
      >
        {(styles) => (
          <div style={{ ...styles, width: "100%" }}>
            <Divider size="sm" w="100%" />
          </div>
        )}
      </Transition>
      <Transition
        mounted={!isAsideOpen}
        transition="fade"
        duration={200}
        enterDelay={200}
      >
        {(styles) => (
          <div style={{ ...styles, width: "100%" }}>
            <Divider size="sm" w="100%" />
          </div>
        )}
      </Transition>
      <TimeTrackerComponent
        isBig={isAsideOpen}
        isTimeTrackerMinimized={isTimeTrackerMinimized}
        setIsTimeTrackerMinimized={setIsTimeTrackerMinimized}
      />
      <Transition
        mounted={isAsideOpen}
        transition="fade"
        duration={200}
        enterDelay={200}
      >
        {(styles) => (
          <div style={{ ...styles, width: "100%" }}>
            <Divider size="sm" w="100%" />
          </div>
        )}
      </Transition>
      <Transition
        mounted={!isAsideOpen}
        transition="fade"
        duration={200}
        enterDelay={200}
      >
        {(styles) => (
          <div style={{ ...styles, width: "100%" }}>
            <Divider size="sm" w="100%" />
          </div>
        )}
      </Transition>
      <CalendarAside isBig={isAsideOpen} />
    </Stack>
  );
}
