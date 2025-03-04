'use client';

import { Drawer, Flex } from '@mantine/core';
import SessionForm from '@/components/Work/Session/SessionForm';
import { Tables } from '@/types/db.types';
import { useWorkStore } from '@/stores/workManagerStore';

interface TimerSessionModalProps {
  timerSession: Tables<'timerSession'>;
  opened: boolean;
  close: () => void;
}

export default function TimerSessionDrawer({ timerSession, opened, close }: TimerSessionModalProps) {
  const { updateTimerSession } = useWorkStore();

  async function handleSubmit(values: {
    start_time: Date;
    active_seconds: number;
    paused_seconds: number;
    currency: string;
    salary: number;
  }) {
    const endTime = new Date(
      values.start_time.getTime() + (values.active_seconds + values.paused_seconds) * 1000
    ).toISOString();

    const newSession: Tables<'timerSession'> = {
      ...values,
      id: timerSession.id,
      project_id: timerSession.project_id,
      user_id: timerSession.user_id,
      start_time: values.start_time.toISOString(),
      end_time: endTime,
    };

    const success = await updateTimerSession(newSession);
    if (success) {
      close();
    }
  }

  return (
      <Drawer opened={opened} onClose={close} title="Edit Timer-Session" size="md" padding="md">
        <Flex direction="column" gap="xl">
          <SessionForm
            initialValues={{
              start_time: new Date(timerSession.start_time),
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
