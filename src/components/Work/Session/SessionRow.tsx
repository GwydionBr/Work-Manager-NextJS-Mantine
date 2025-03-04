'use client';

import { IconClock } from '@tabler/icons-react';
import { Card, Group, Stack, Text } from '@mantine/core';
import { useDisclosure, useHover } from '@mantine/hooks';
import DeleteButton from '@/components/Work/Buttons/DeleteButton';
import EditButton from '@/components/Work/Buttons/EditButton';
import DeleteSessionModal from '@/components/Work/Session/DeleteSessionModal';
import TimerSessionDrawer from '@/components/Work/Session/TimerSessionDrawer';
import { useWorkStore } from '@/stores/workManagerStore';
import type { Tables } from '@/types/db.types';
import { formatTime } from '@/utils/workHelperFunctions';
import * as helper from '@/utils/workHelperFunctions';


interface SessionRowProps {
  session: Tables<'timerSession'>;
}

export default function SessionRow({ session }: SessionRowProps) {
  const [deleteModalOpened, deleteModalHandler] = useDisclosure(false);
  const [editDrawerOpened, editDrawerHandler] = useDisclosure(false);
  const { deleteTimerSession } = useWorkStore();

  const { hovered, ref } = useHover();

  async function handleDelete() {
    const success = await deleteTimerSession(session.id);
    if (success) {
      deleteModalHandler.close();
    }
  }

  const earnings = Number(((session.active_seconds * session.salary) / 3600).toFixed(2));

  return (
    <>
      <Card shadow="xs" withBorder p="sm" mt="sm" radius={20} ref={ref}>
        <Group justify="space-between">
          <Group gap="xl">
            <Stack gap="xs">
              <Group>
                <IconClock size={14} color="gray" />
                <Text>
                  {helper.formatTimeSpan(new Date(session.start_time), new Date(session.end_time))}
                </Text>
              </Group>
              <Group>
                <Text size="sm" c="teal">
                  Active: {formatTime(session.active_seconds)}
                </Text>
                <Text size="sm" c="dimmed">
                  Paused: {formatTime(session.paused_seconds)}
                </Text>
              </Group>
            </Stack>
            {hovered && (
              <Group>
                <EditButton onClick={() => editDrawerHandler.open()} />
                <DeleteButton onClick={() => deleteModalHandler.open()} />
              </Group>
            )}
          </Group>
          <Text>{helper.formatMoney(earnings, session.currency)}</Text>
        </Group>
      </Card>

      <TimerSessionDrawer
        timerSession={session}
        opened={editDrawerOpened}
        close={() => editDrawerHandler.close()}
      />

      <DeleteSessionModal
        opened={deleteModalOpened}
        onClose={() => deleteModalHandler.close()}
        onDelete={handleDelete}
      />
    </>
  );
}