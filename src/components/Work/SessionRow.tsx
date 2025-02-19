'use client';

import { useState } from 'react';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Button, Card, Group, Modal, Text } from '@mantine/core';
import type { Tables } from '@/db.types';

interface SessionRowProps {
  session: Tables<'timerSession'>;
  onEdit: (session: Tables<'timerSession'>) => void;
  onDelete: (session: Tables<'timerSession'>) => void;
}

export default function SessionRow({ session, onEdit, onDelete }: SessionRowProps) {
  const [opened, setOpened] = useState(false);

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Group style={{ justifyContent: 'space-between' }}>
        <Text>{session.id}</Text>
        <Group>
          <Text size="sm">Active: {session.active_seconds}s</Text>
          <Text size="sm">Paused: {session.paused_seconds}s</Text>
          <Text size="sm">
            {session.currency} {session.salary}
          </Text>
        </Group>
        <Group>
          <Button variant="subtle" color="blue" onClick={() => onEdit(session)}>
            <IconEdit size={18} />
          </Button>
          <Button variant="subtle" color="red" onClick={() => setOpened(true)}>
            <IconTrash size={18} />
          </Button>
        </Group>
      </Group>

      <Modal opened={opened} onClose={() => setOpened(false)} title="Confirm Deletion">
        <Text>Do you really want to delete this session? This action cannot be undone.</Text>
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setOpened(false)}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={() => {
              onDelete(session);
              setOpened(false);
            }}
          >
            Delete
          </Button>
        </Group>
      </Modal>
    </Card>
  );
}
