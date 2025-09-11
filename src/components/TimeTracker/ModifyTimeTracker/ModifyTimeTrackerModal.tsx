"use client";

import { useState } from "react";
import { useSettingsStore } from "@/stores/settingsStore";

import { Text, Modal, Box, Group, Tabs } from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import MoreActionIcon from "../../UI/ActionIcons/MoreActionIcon";
import ModifyTime from "./ModifyTime";
import ModifyRounding from "./ModifyRounding";

import { TimerState } from "@/types/timeTracker.types";
import { RoundingDirection } from "@/types/settings.types";

interface ModifyTimeTrackerModalProps {
  modifyActiveSeconds: (delta: number) => void;
  modifyPausedSeconds: (delta: number) => void;
  setTimerRounding: (
    roundingInterval: number,
    roundingDirection: RoundingDirection
  ) => void;
  activeTime: string; 
  pausedTime: string;
  state: TimerState;
  activeSeconds: number;
  storedActiveSeconds: number;
  storedPausedSeconds: number;
  roundingDirection: RoundingDirection;
  roundingInterval: number;
}

export default function ModifyTimeTrackerModal({
  modifyActiveSeconds,
  modifyPausedSeconds,
  setTimerRounding,
  activeTime,
  pausedTime,
  state,
  activeSeconds,
  storedActiveSeconds,
  storedPausedSeconds,
  roundingDirection,
  roundingInterval,
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
              setTimerRounding={setTimerRounding}
              activeSeconds={activeSeconds}
              roundingDirection={roundingDirection}
              roundingInterval={roundingInterval}
            />
          </Tabs.Panel>
        </Tabs>
      </Modal>
    </Box>
  );
}
