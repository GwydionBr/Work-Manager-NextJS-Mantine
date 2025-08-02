"use client";

import { useState } from "react";
import { useTimeTracker } from "@/stores/timeTrackerStore";

import { Stack, Text, Modal, Box } from "@mantine/core";
import MoreActionIcon from "../UI/ActionIcons/MoreActionIcon";

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
        onClose={() => setOpened(false)}
        title="Modify Time Tracker"
      >
        <Stack>
          <Text>Active Time</Text>
          
        </Stack>
      </Modal>
    </Box>
  );
}
