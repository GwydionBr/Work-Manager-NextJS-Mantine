"use client";

import { useSettingsStore } from "@/stores/settingsStore";

import { Group, Modal, Tabs, Text } from "@mantine/core";
import DefaultSettings from "./General/GeneralSettings";
import FinanceSettings from "./Finances/FinanceSettings";
import {
  IconCurrencyDollar,
  IconBriefcase,
  IconSettings,
} from "@tabler/icons-react";
import WorkSettings from "./Work/WorkSettings";

export enum SettingsTab {
  GENERAL = "general",
  WORK = "work",
  FINANCE = "finance",
  // GROUP = "group",
}

export default function SettingsModal() {
  const { locale, selectedTab, setSelectedTab, isModalOpen, setIsModalOpen } =
    useSettingsStore();

  return (
    <Modal
      opened={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title={
        <Group gap="xs">
          <IconSettings size={16} />
          <Text fw={600}>
            {locale === "de-DE" ? "Einstellungen" : "Settings"}
          </Text>
        </Group>
      }
      size="80%"
      centered
      radius="lg"
    >
      <Tabs
        mih="80vh"
        value={selectedTab}
        onChange={(value) => setSelectedTab(value as SettingsTab)}
      >
        <Tabs.List mb="md" grow>
          <Tabs.Tab
            value={SettingsTab.GENERAL}
            leftSection={<IconSettings size={16} />}
          >
            {locale === "de-DE" ? "Allgemein" : "General"}
          </Tabs.Tab>
          <Tabs.Tab
            value={SettingsTab.WORK}
            leftSection={<IconBriefcase size={16} />}
          >
            {locale === "de-DE" ? "Arbeit" : "Work"}
          </Tabs.Tab>
          <Tabs.Tab
            value={SettingsTab.FINANCE}
            leftSection={<IconCurrencyDollar size={16} />}
          >
            {locale === "de-DE" ? "Finanzen" : "Finance"}
          </Tabs.Tab>
          {/* <Tabs.Tab
            value={SettingsTab.GROUP}
            leftSection={<IconUsers size={16} />}
          >
            {locale === "de-DE" ? "Gruppen" : "Group"}
          </Tabs.Tab> */}
        </Tabs.List>
        <Tabs.Panel value={SettingsTab.GENERAL}>
          <DefaultSettings />
        </Tabs.Panel>
        <Tabs.Panel value={SettingsTab.WORK}>
          <WorkSettings />
        </Tabs.Panel>
        <Tabs.Panel value={SettingsTab.FINANCE}>
          <FinanceSettings />
        </Tabs.Panel>
        {/* <Tabs.Panel value={SettingsTab.GROUP}>
          <GroupSettings />
        </Tabs.Panel> */}
      </Tabs>
    </Modal>
  );
}
