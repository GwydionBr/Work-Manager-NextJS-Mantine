"use client";

import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useWorkStore } from "@/stores/workManagerStore";

import { Box, Drawer, Flex } from "@mantine/core";
import SessionForm from "@/components/Work/Session/SessionForm";
import AddActionIcon from "@/components/UI/ActionIcons/AddActionIcon";

import { TablesInsert } from "@/types/db.types";
import { Currency } from "@/types/settings.types";

export default function NewSessionButton() {
  const [opened, { open, close }] = useDisclosure(false);
  const { activeProjectId, addTimerSession } = useWorkStore();
  const activeProject = useWorkStore((state) =>
    state.projects.find((p) => p.project.id === activeProjectId)
  );
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(values: {
    start_time: string;
    end_time: string;
    active_seconds: number;
    paused_seconds: number;
    currency: Currency;
    salary: number;
  }) {
    if (!activeProject) {
      return;
    }
    setSubmitting(true);

    const newSession: TablesInsert<"timerSession"> = {
      ...values,
      project_id: activeProject.project.id,
      user_id: activeProject.project.user_id,
      start_time: new Date(values.start_time).toISOString(),
      end_time: new Date(values.end_time).toISOString(),
      true_end_time: new Date(values.end_time).toISOString(),
      hourly_payment: activeProject.project.hourly_payment,
      salary: activeProject.project.hourly_payment ? values.salary : 0,
      currency: activeProject.project.hourly_payment
        ? values.currency
        : activeProject.project.currency,
    };

    const success = await addTimerSession(newSession);
    if (success) {
      close();
    }
    setSubmitting(false);
  }

  return (
    <Box>
      <Drawer
        opened={opened}
        onClose={close}
        title="Add Session"
        size="md"
        padding="md"
      >
        <Flex direction="column" gap="xl">
          <SessionForm
            initialValues={{
              start_time: new Date().toISOString(),
              end_time: new Date().toISOString(),
              active_seconds: 0,
              paused_seconds: 0,
              currency: activeProject?.project.currency || "USD",
              salary: activeProject?.project.hourly_payment
                ? activeProject?.project.salary || 0
                : 0,
            }}
            onSubmit={handleSubmit}
            onCancel={close}
            newSession
            project={activeProject?.project}
            submitting={submitting}
          />
        </Flex>
      </Drawer>

      <AddActionIcon
        aria-label="Add session"
        onClick={open}
        size="md"
        tooltipLabel="Add session"
      />
    </Box>
  );
}
