import { IconClock } from '@tabler/icons-react';
import { Card, Group, Text } from '@mantine/core';
import type { Tables } from '@/types/db.types';
import { formatTime } from '@/utils/workHelperFunctions';

interface SessionRowProps {
  session: Tables<'timerSession'>;
}

export default function SessionRow({ session }: SessionRowProps) {
  return (
    <Card shadow="xs" withBorder p="sm" mt="sm">
      <Group>
        <IconClock size={14} color="gray" />
        <Text>
          {session.start_time ? new Date(session.start_time).toLocaleTimeString() : 'No start time'}
        </Text>
      </Group>
      <Text size="sm" color="dimmed">
        Active: {formatTime(session.active_seconds)} | Paused: {formatTime(session.paused_seconds)}
      </Text>
    </Card>
  );
}
