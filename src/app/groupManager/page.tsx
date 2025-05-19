"use client";

import { Container } from "@mantine/core";
import classes from "./GroupManager.module.css";
import Header from "@/components/Header/Header";
import { Tabs, useMantineColorScheme, Text } from "@mantine/core";
import { IconCalendar, IconList, IconChecklist } from "@tabler/icons-react";
import GroceryList from "@/components/GroupManager/Grocery/GroceryList";

export default function GroupManagerPage() {
  const { colorScheme } = useMantineColorScheme();

  return (
    <Container className={classes.groupManagerMainContainer}>
      <Header headerTitle="Group Manager" />
      <Tabs
        defaultValue="Calendar"
        w="100%"
        color={colorScheme === "dark" ? "grape.9" : "teal.5"}
      >
        <Tabs.List grow my="xl">
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
    </Container>
  );
}
