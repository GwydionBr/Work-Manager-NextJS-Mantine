"use client";

import { useState } from "react";

import { Text, Modal, Box, Group, Tabs } from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import MoreActionIcon from "../../UI/ActionIcons/MoreActionIcon";
import ModifyTime from "./ModifyTime";
import ModifyRounding from "./ModifyRounding";

export default function ModifyTimeTrackerModal() {
  const [opened, setOpened] = useState(false);

  return (
    <Box>
      <MoreActionIcon
        onClick={() => setOpened(true)}
        aria-label="Modify Time Tracker"
        tooltipLabel="Modify Time Tracker"
      />
      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false);
        }}
        title={
          <Group gap="xs">
            <IconSettings size={20} />
            <Text fw={600}>Modify Time Tracker</Text>
          </Group>
        }
        size="lg"
        styles={{
          title: {
            fontSize: "1.2rem",
            fontWeight: 600,
          },
          header: {
            borderBottom:
              "1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-3))",
            paddingBottom: "1rem",
          },
        }}
      >
        <Tabs defaultValue="time" variant="pills">
          <Tabs.List grow mb="md">
            <Tabs.Tab value="time">
              Time
            </Tabs.Tab>
            <Tabs.Tab value="rounding">
              Rounding
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="time">
            <ModifyTime />
          </Tabs.Panel>
          <Tabs.Panel value="rounding">
            <ModifyRounding />
          </Tabs.Panel>
        </Tabs>
      </Modal>
    </Box>
  );
}
