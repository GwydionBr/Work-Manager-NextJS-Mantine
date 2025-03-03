'use client';

import { useState } from 'react';
import { IconClock } from '@tabler/icons-react';
import { Trash2 } from 'lucide-react';
import { ActionIcon, Card, Group, Stack, Text } from '@mantine/core';
import { useHover } from '@mantine/hooks';
import DeleteSessionModal from '@/components/Work/Session/DeleteSessionModal';
import EditSessionButton from '@/components/Work/Session/EditSessionButton';
import { useWorkStore } from '@/stores/workManagerStore';
import type { Tables } from '@/types/db.types';
import { formatTime } from '@/utils/workHelperFunctions';
import * as helper from '@/utils/workHelperFunctions';


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

  const earnings =Number((session.active_seconds * session.salary / 3600).toFixed(2));

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
                <EditSessionButton timerSession={session} />
                <ActionIcon
                  onClick={() => setDeleteModalOpened(true)}
                  color="red"
                  variant="transparent"
                >
                  <Trash2 size={20} />
                </ActionIcon>
              </Group>
            )}
          </Group>
          <Text>{helper.formatMoney(earnings, session.currency)}</Text>
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
