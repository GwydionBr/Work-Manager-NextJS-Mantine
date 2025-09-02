"use client";

import { useState, useEffect } from "react";
import { useGroupStore } from "@/stores/groupStore";

import {
  ActionIcon,
  Group,
  ScrollArea,
  Stack,
  Text,
  Kbd,
} from "@mantine/core";
import { IconArrowBarLeft } from "@tabler/icons-react";
import NotificationAside from "../Notification/NotificationAside";
import TimeTrackerManager from "../TimeTracker/TimeTrackerManager";

import classes from "./AppShell.module.css";
import TransitionDivider from "../UI/TransitionDivider";
import DelayedTooltip from "../UI/DelayedTooltip";
import Shortcut from "../UI/Shortcut";

interface AsideProps {
  toggleAside: () => void;
  isAsideOpen: boolean;
}

export default function Aside({ toggleAside, isAsideOpen }: AsideProps) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isTimeTrackerMinimized, setIsTimeTrackerMinimized] = useState(false);
  const [currentSelectedDate, setCurrentSelectedDate] = useState<Date | null>(
    null
  );

  const { selectedDate, isDateChanged } = useGroupStore();

  useEffect(() => {
    if (isDateChanged && selectedDate !== currentSelectedDate) {
      setCurrentSelectedDate(selectedDate);
      setIsTimeTrackerMinimized(true);
      setIsNotificationOpen(false);
    }
  }, [selectedDate, isDateChanged]);

  return (
    <Stack py="md" h="100%" align="center">
      <Stack align="flex-start" w="100%" gap="lg">
        <Group pl="xs" justify="flex-start">
          <DelayedTooltip
            label={
              <Stack align="center">
                <Text>Toggle Sidebar</Text>
                <Shortcut keys={["mod", "B"]} />
              </Stack>
            }
          >
            <ActionIcon
              onClick={toggleAside}
              aria-label="Toggle Sidebar"
              variant="transparent"
            >
              <IconArrowBarLeft
                className={classes.icon}
                style={{ transform: isAsideOpen ? "rotate(180deg)" : "none" }}
              />
            </ActionIcon>
          </DelayedTooltip>
        </Group>
        <Group pl="xs">
          <NotificationAside
            isNotificationOpen={isNotificationOpen}
            asideOpened={isAsideOpen}
            setIsNotificationOpen={setIsNotificationOpen}
          />
        </Group>
      </Stack>
      <TransitionDivider
        mounted={isAsideOpen}
        transition="fade"
        duration={200}
        enterDelay={200}
      />
      <ScrollArea type="never">
        <TimeTrackerManager
          isBig={isAsideOpen}
          isTimeTrackerMinimized={isTimeTrackerMinimized}
          setIsTimeTrackerMinimized={setIsTimeTrackerMinimized}
        />
        <TransitionDivider
          mounted={isAsideOpen}
          transition="fade"
          duration={200}
          enterDelay={200}
        />
        {/* <CalendarAside isBig={isAsideOpen} /> */}
      </ScrollArea>
    </Stack>
  );
}
