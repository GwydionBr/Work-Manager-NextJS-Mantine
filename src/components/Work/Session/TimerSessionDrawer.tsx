"use client";

import { useWorkStore } from "@/stores/workManagerStore";

import { Drawer, Flex } from "@mantine/core";
import SessionForm from "@/components/Work/Session/SessionForm";

import { Currency } from "@/types/settings.types";
import { Tables } from "@/types/db.types";

interface TimerSessionModalProps {
  timerSession: Tables<"timerSession">;
  opened: boolean;
  close: () => void;
}

export default function TimerSessionDrawer({
  timerSession,
  opened,
  close,
}: TimerSessionModalProps) {
  const { updateTimerSession } = useWorkStore();

  async function handleSubmit(values: {
    start_time: string;
    active_seconds: number;
    paused_seconds: number;
    currency: Currency;
    salary: number;
  }) {
    const endTime = new Date(
      new Date(values.start_time).getTime() +
        (values.active_seconds + values.paused_seconds) * 1000
    ).toISOString();

    const newSession: Tables<"timerSession"> = {
      ...values,
      created_at: new Date().toISOString(),
      id: timerSession.id,
      project_id: timerSession.project_id,
      user_id: timerSession.user_id,
      start_time: values.start_time,
      hourly_payment: timerSession.hourly_payment,
      end_time: endTime,
    };

    const success = await updateTimerSession(newSession);
    if (success) {
      close();
    }
  }

  return (
    <Drawer
      opened={opened}
      onClose={close}
      title="Edit Timer-Session"
      size="md"
      padding="md"
    >
      <Flex direction="column" gap="xl">
        <SessionForm
          initialValues={{
            start_time: timerSession.start_time,
            active_seconds: timerSession.active_seconds,
            paused_seconds: timerSession.paused_seconds,
            currency: timerSession.currency,
            salary: timerSession.salary,
          }}
          onSubmit={handleSubmit}
          onCancel={close}
          newSession={false}
        />
      </Flex>
    </Drawer>
  );
}
