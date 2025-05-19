"use client";

import { Tabs, useMantineColorScheme, Text } from "@mantine/core";
import { IconCalendar, IconList, IconChecklist } from "@tabler/icons-react";

export default function GroupManagerTabs() {
  const { colorScheme } = useMantineColorScheme();

  return (
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
      <Tabs.Panel value="Grocery List">
        <Text>Grocery List</Text>
      </Tabs.Panel>
      <Tabs.Panel value="To Do">
        <Text>To Do</Text>
      </Tabs.Panel>
    </Tabs>
  );
}
