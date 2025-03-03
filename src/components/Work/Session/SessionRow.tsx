'use client';

import { useState } from 'react';
import { IconClock } from '@tabler/icons-react';
import { Trash2 } from 'lucide-react';
import { ActionIcon, Card, Group, Stack, Text } from '@mantine/core';
import { useHover } from '@mantine/hooks';
import { useWorkStore } from '@/stores/workManagerStore';
import type { Tables } from '@/types/db.types';
import { formatTime } from '@/utils/workHelperFunctions';
import DeleteSessionModal from '@/components/Work/Session/DeleteSessionModal';
import EditSessionButton from '@/components/Work/Session/EditSessionButton';


interface SessionRowProps {
  session: Tables<'timerSession'>;
}

export default function SessionRow({ session }: SessionRowProps) {
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const { deleteTimerSession } = useWorkStore();

  const { hovered, ref } = useHover();

  async function handleDelete() {
    const success = await deleteTimerSession(session.id);
    if (success
    ) {
    setDeleteModalOpened(false);
    }
  }

  const earnings = (session.active_seconds * session.salary / 3600).toFixed(2);

  return (
    <>
      <Card shadow="xs" withBorder p="sm" mt="sm" radius={20} ref={ref}> 
        <Group justify="space-between">
          <Stack gap="xs">
            <Group>
              <IconClock size={14} color="gray" />
              <Text>
                {session.start_time
                  ? new Date(session.start_time).toLocaleTimeString()
                  : 'No start time'}
              </Text>
            </Group>
            <Text size="sm" c="dimmed">
              Active: {formatTime(session.active_seconds)} | Paused:{' '}
              {formatTime(session.paused_seconds)}
            </Text>
          </Stack>
          <Text>
            {earnings} {session.currency}
          </Text>
          {
            hovered && (
              <Group>
                <EditSessionButton timerSession={session} />
                <ActionIcon onClick={() => setDeleteModalOpened(true)} color="red" variant="transparent">
                  <Trash2 size={20} />
                </ActionIcon>
              </Group>
            )
          }
        </Group>
      </Card>

      <DeleteSessionModal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        onDelete={handleDelete}
      />
    </>
  );
}