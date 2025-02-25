'use client';

import { Button, Card, Text } from '@mantine/core';
import { useTimeTracker } from '@/store/timeTrackerStore';

export default function TimeTrackerComponent() {
  const {
    projectTitle,
    moneyEarned,
    activeTime,
    pausedTime,
    state,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
  } = useTimeTracker();

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Text size="xl" pb={20}>
        {projectTitle}
      </Text>
      <Text size="lg">💰 Geld verdient: {moneyEarned} $</Text>
      <Text>⏱ Aktive Zeit: {activeTime}</Text>
      <Text>⏸ Pausierte Zeit: {pausedTime}</Text>
      <Text>📌 Status: {state}</Text>

      {state === 'stopped' && (
        <Button onClick={startTimer} color="green" mt="sm">
          Start
        </Button>
      )}
      {state === 'running' && (
        <Button onClick={pauseTimer} color="yellow" mt="sm">
          Pause
        </Button>
      )}
      {state === 'paused' && (
        <Button onClick={resumeTimer} color="blue" mt="sm">
          Weiter
        </Button>
      )}
      {state !== 'stopped' && (
        <Button onClick={stopTimer} color="red" mt="sm">
          Stop
        </Button>
      )}
    </Card>
  );
}
