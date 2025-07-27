"use client";

import { Modal, Tabs } from "@mantine/core";
import DefaultSettings from "./Default/DefaultSettings";
import FinancesSettings from "./Finances/FinancesSettings";
import GroupSettings from "./Group/GroupSettings";
import {
  IconCurrencyDollar,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";

interface SettingsModalProps {
  opened: boolean;
  defaultTab: "general" | "finance" | "group";
  close: () => void;
}

export default function SettingsModal({
  opened,
  close,
  defaultTab = "general",
}: SettingsModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={close}
      title="Settings"
      size="80%"
      centered
      radius="lg"
    >
      <Tabs mih="80vh" defaultValue={defaultTab}>
        <Tabs.List mb="md" grow>
          <Tabs.Tab value="general" leftSection={<IconSettings size={16} />}>
            General
          </Tabs.Tab>
          <Tabs.Tab
            value="finance"
            leftSection={<IconCurrencyDollar size={16} />}
          >
            Finance
          </Tabs.Tab>
          <Tabs.Tab value="group" leftSection={<IconUsers size={16} />}>
            Group
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="general">
          <DefaultSettings />
        </Tabs.Panel>
        <Tabs.Panel value="finance">
          <FinancesSettings />
        </Tabs.Panel>
        <Tabs.Panel value="group">
          <GroupSettings />
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
}
