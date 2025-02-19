'use client';

import { Container, Paper, Stack, Title } from '@mantine/core';
import type { Tables } from '@/db.types';
import SessionRow from './SessionRow';

interface SessionListProps {
  sessions: Tables<'timerSession'>[];
  onEdit: (session: Tables<'timerSession'>) => void;
  onDelete: (session: Tables<'timerSession'>) => void;
}

export default function SessionList({ sessions, onEdit, onDelete }: SessionListProps) {
  return (
    <Container>
      <Title order={2} mb="md">
        Sessions
      </Title>
      {sessions.length > 0 ? (
        <Stack>
          {sessions.map((session) => (
            <SessionRow key={session.id} session={session} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </Stack>
      ) : (
        <Paper p="md" shadow="xs" radius="md">
          <Title order={4} style={{ color: 'gray' }}>
            No Sessions
          </Title>
        </Paper>
      )}
    </Container>
  );
}
