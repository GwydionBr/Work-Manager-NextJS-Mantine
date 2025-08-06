"use client";

import { useState } from "react";

import { Text, Modal, Box, Group, Tabs } from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import MoreActionIcon from "../../UI/ActionIcons/MoreActionIcon";
import ModifyTime from "./ModifyTime";
import ModifyRounding from "./ModifyRounding";

import { TimerState } from "@/stores/timeTrackerStore";
import { RoundingAmount, RoundingDirection } from "@/types/settings.types";

interface ModifyTimeTrackerModalProps {
  modifyActiveSeconds: (delta: number) => void;
  modifyPausedSeconds: (delta: number) => void;
  setRoundingAmount: (
    roundingAmount: RoundingAmount,
    roundingMode: RoundingDirection,
    customRoundingAmount: number
  ) => void;
  activeTime: string;
  pausedTime: string;
  state: TimerState;
  activeSeconds: number;
  roundingMode: RoundingDirection;
  roundingInterval: number;
}

export default function ModifyTimeTrackerModal({
  modifyActiveSeconds,
  modifyPausedSeconds,
  setRoundingAmount,
  activeTime,
  pausedTime,
  state,
  activeSeconds,
  roundingMode,
  roundingInterval,
}: ModifyTimeTrackerModalProps) {
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
            <Tabs.Tab value="time">Time</Tabs.Tab>
            <Tabs.Tab value="rounding">Rounding</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="time">
            <ModifyTime
              modifyActiveSeconds={modifyActiveSeconds}
              modifyPausedSeconds={modifyPausedSeconds}
              activeTime={activeTime}
              pausedTime={pausedTime}
              state={state}
            />
          </Tabs.Panel>
          <Tabs.Panel value="rounding">
            <ModifyRounding
              setRoundingAmount={setRoundingAmount}
              activeSeconds={activeSeconds}
              roundingMode={roundingMode}
              roundingInterval={roundingInterval}
            />
          </Tabs.Panel>
        </Tabs>
      </Modal>
    </Box>
  );
}
