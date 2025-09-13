"use client";

import { useState } from "react";
import { useSettingsStore } from "@/stores/settingsStore";

import { Text, Modal, Box, Group, Tabs } from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import MoreActionIcon from "../../UI/ActionIcons/MoreActionIcon";
import ModifyTime from "./ModifyTime";
import ModifyRounding from "./ModifyRounding";

import { TimerRoundingSettings, TimerState } from "@/types/timeTracker.types";

interface ModifyTimeTrackerModalProps {
  modifyActiveSeconds: (delta: number) => void;
  modifyPausedSeconds: (delta: number) => void;
  setTempTimerRounding: (
    timerRoundingSettings: TimerRoundingSettings
  ) => void;
  activeTime: string; 
  pausedTime: string;
  state: TimerState;
  activeSeconds: number;
  storedActiveSeconds: number;
  storedPausedSeconds: number;
  timerRoundingSettings: TimerRoundingSettings;
}

export default function ModifyTimeTrackerModal({
  modifyActiveSeconds,
  modifyPausedSeconds,
  setTempTimerRounding,
  activeTime,
  pausedTime,
  state,
  activeSeconds,
  storedActiveSeconds,
  storedPausedSeconds,
  timerRoundingSettings,
}: ModifyTimeTrackerModalProps) {
  const { locale } = useSettingsStore();
  const [opened, setOpened] = useState(false);

  return (
    <Box>
      <MoreActionIcon
        onClick={() => setOpened(true)}
        aria-label="Modify Time Tracker"
        tooltipLabel={locale === "de-DE" ? "Zeiterfassung anpassen" : "Modify Time Tracker"}
      />
      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false);
        }}
        title={
          <Group gap="xs">
            <IconSettings size={20} />
            <Text fw={600}>{locale === "de-DE" ? "Zeiterfassung anpassen" : "Modify Time Tracker"}</Text>
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
            <Tabs.Tab value="time">{locale === "de-DE" ? "Zeit" : "Time"}</Tabs.Tab>
            <Tabs.Tab value="rounding">{locale === "de-DE" ? "Rundung" : "Rounding"}</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="time">
            <ModifyTime
              modifyActiveSeconds={modifyActiveSeconds}
              modifyPausedSeconds={modifyPausedSeconds}
              activeTime={activeTime}
              pausedTime={pausedTime}
              state={state}
              storedActiveSeconds={storedActiveSeconds}
              storedPausedSeconds={storedPausedSeconds}
            />
          </Tabs.Panel>
          <Tabs.Panel value="rounding">
            <ModifyRounding
              setTempTimerRounding={setTempTimerRounding}
              activeSeconds={activeSeconds}
              timerRoundingSettings={timerRoundingSettings}
              onClose={() => setOpened(false)}
            />
          </Tabs.Panel>
        </Tabs>
      </Modal>
    </Box>
  );
}
