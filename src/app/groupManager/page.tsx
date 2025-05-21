"use client";

import { useGroupStore } from "@/stores/groupStore";

import classes from "./GroupManager.module.css";

import { Box, Loader, Tabs, Text } from "@mantine/core";
import { IconCalendar, IconList, IconChecklist } from "@tabler/icons-react";
import Header from "@/components/Header/Header";
import GroceryList from "@/components/GroupManager/Grocery/GroceryList";
import GroupInitializer from "@/components/GroupManager/GroupInitializer";


export default function GroupManagerPage() {
  const { isLoading, groups, activeGroup } = useGroupStore();

  return (
    <Box className={classes.groupManagerMainContainer} px="xl">
      <Header headerTitle={activeGroup?.title || "Group Manager"} />
      {isLoading && <Loader />}
      {!isLoading && groups.length > 0 && (
        <Tabs
          defaultValue="Grocery List"
          w="100%"
          color={"teal.5"}
        >
          <Tabs.List grow my="xl" >
            <Tabs.Tab leftSection={<IconCalendar />} value="Calendar">
              Calendar
            </Tabs.Tab>
            <Tabs.Tab leftSection={<IconList />} value="Grocery List">
              Grocery List
            </Tabs.Tab>
            <Tabs.Tab leftSection={<IconChecklist />} value="To Do">
              To Do
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="Calendar">
            <Text>Calendar</Text>
          </Tabs.Panel>
          <Tabs.Panel
            value="Grocery List"
            className={classes.groceryListContainer}
          >
            <GroceryList />
          </Tabs.Panel>
          <Tabs.Panel value="To Do">
            <Text>To Do</Text>
          </Tabs.Panel>
        </Tabs>
      )}
      {!isLoading && groups.length === 0 && <GroupInitializer />}
    </Box>
  );
}
