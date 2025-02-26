'use client';

import { useState } from 'react';
import { IconClock } from '@tabler/icons-react';
import { Trash2 } from 'lucide-react';
import { ActionIcon, Card, Group, Stack, Text } from '@mantine/core';
import { useWorkStore } from '@/stores/workManagerStore';
import type { Tables } from '@/types/db.types';
import { formatTime } from '@/utils/workHelperFunctions';
import DeleteSessionModal from './DeleteSessionModal';


interface SessionRowProps {
  session: Tables<'timerSession'>;
}

export default function SessionRow({ session }: SessionRowProps) {
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const { deleteTimerSession } = useWorkStore();

  async function handleDelete() {
    const success = await deleteTimerSession(session.id);
    if (success
    ) {
    setDeleteModalOpened(false);
    }
  }

  return (
    <>
      <Card shadow="xs" withBorder p="sm" mt="sm">
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
            <Text size="sm" color="dimmed">
              Active: {formatTime(session.active_seconds)} | Paused:{' '}
              {formatTime(session.paused_seconds)}
            </Text>
          </Stack>
          <Group>
            <ActionIcon onClick={() => setDeleteModalOpened(true)} color="red" variant="transparent">
              <Trash2 size={20} />
            </ActionIcon>
          </Group>
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