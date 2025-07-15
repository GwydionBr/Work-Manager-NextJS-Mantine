"use client";

import { useDisclosure } from "@mantine/hooks";
import { useWorkStore } from "@/stores/workManagerStore";

import { Drawer, Flex } from "@mantine/core";
import SessionForm from "@/components/Work/Session/SessionForm";
import AddActionIcon from "@/components/UI/Buttons/AddActionIcon";

import { TablesInsert } from "@/types/db.types";
import { Currency } from "@/types/settings.types";

export default function NewSessionButton() {
  const [opened, { open, close }] = useDisclosure(false);
  const { activeProjectId, addTimerSession } = useWorkStore();
  const activeProject = useWorkStore((state) =>
    state.projects.find((p) => p.project.id === activeProjectId)
  );

  async function handleSubmit(values: {
    start_time: string;
    active_seconds: number;
    paused_seconds: number;
    currency: Currency;
    salary: number;
  }) {
    if (!activeProject) {
      return;
    }

    const endTime = new Date(
      new Date(values.start_time).getTime() +
        (values.active_seconds + values.paused_seconds) * 1000
    ).toISOString();

    const newSession: TablesInsert<"timerSession"> = {
      ...values,
      project_id: activeProject.project.id,
      user_id: activeProject.project.user_id,
      start_time: new Date(values.start_time).toISOString(),
      end_time: endTime,
      true_end_time: endTime,
      salary: activeProject.project.hourly_payment ? values.salary : 0,
      currency: activeProject.project.hourly_payment
        ? values.currency
        : activeProject.project.currency,
    };

    const success = await addTimerSession(newSession);
    if (success) {
      close();
    }
  }

  return (
    <>
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
          />
        </Flex>
      </Drawer>

      <AddActionIcon aria-label="Add session" onClick={open} size="md" />
    </>
  );
}
