"use client";

import { useGroupStore } from "@/stores/groupStore";

import classes from "./GroupManager.module.css";

import { Box, Loader, Tabs } from "@mantine/core";
import { IconCalendar, IconChecklist, IconListCheck } from "@tabler/icons-react";
import Header from "@/components/Header/Header";
import EditGroupButton from "@/components/GroupManager/Group/EditGroupButton";
import TaskList from "@/components/GroupManager/ToDo/TaskList";
import Calendar from "@/components/Calendar/Calendar";

export default function GroupManagerPage() {
  const { isFetching, groups, activeGroupId } = useGroupStore();
  const activeGroup = useGroupStore((state) =>
    state.groups.find((g) => g.id === activeGroupId)
  );

  return (
    <Box className={classes.groupManagerMainContainer} px="xl">
      <Header
        headerTitle={activeGroup?.title || "Group Manager"}
        rightButton={activeGroup ? <EditGroupButton /> : null}
      />
      {isFetching && <Loader />}
      {!isFetching && groups.length > 0 && (
        <Tabs defaultValue="Calendar" w="100%" color={"teal.5"}>
          <Tabs.List grow mb="xl">
            <Tabs.Tab
              leftSection={<IconCalendar color="light-dark(blue, cyan)" />}
              value="Calendar"
            >
              Calendar
            </Tabs.Tab>
            <Tabs.Tab
              leftSection={<IconListCheck color="light-dark(blue, cyan)" />}
              value="Tasks"
            >
              Tasks
            </Tabs.Tab>
            <Tabs.Tab
              leftSection={<IconChecklist color="light-dark(blue, cyan)" />}
              value="To Do"
            >
              To Do
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="Calendar">
            <Box className={classes.mainCalendarContainer}>
              <Calendar />
            </Box>
          </Tabs.Panel>
          <Tabs.Panel value="To Do">
            <TaskList />
          </Tabs.Panel>
        </Tabs>
      )}
    </Box>
  );
}
