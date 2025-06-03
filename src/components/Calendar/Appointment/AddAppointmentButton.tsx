"use client";

import { useDisclosure } from "@mantine/hooks";
import { useGroupStore } from "@/stores/groupStore";

import { Box, Modal } from "@mantine/core";
import AddActionIcon from "../../UI/Buttons/AddActionIcon";
import AppointmentForm from "./AppointmentForm";

export default function AddAppointmentButton() {
  const [opened, { open, close }] = useDisclosure(false);
  const { activeGroup } = useGroupStore();

  if (!activeGroup) return null;

  return (
    <Box>
      <AddActionIcon onClick={open}/>
      <Modal opened={opened} onClose={close} title="Add Appointment" size="md" padding="md">
        <AppointmentForm onClose={close} groupId={activeGroup.id} />
      </Modal>
    </Box>
  );
}