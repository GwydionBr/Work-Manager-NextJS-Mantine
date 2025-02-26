'use client';

import { useState } from 'react';
import { Button, Card, Text } from '@mantine/core';
import { useTimeTracker } from '@/stores/timeTrackerStore';
import { useWorkStore } from '@/stores/workManagerStore';

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
    getCurrentSession,
    stopTimer,
  } = useTimeTracker();

  const { addTimerSession } = useWorkStore();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function submitTimer() {
      setErrorMessage(null);
      const newSession = getCurrentSession();
      pauseTimer();
      const result = await addTimerSession(newSession);
      if (result) {
        stopTimer();
      } else {
        setErrorMessage('Fehler beim Speichern der Session');
      }
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Text size="xl" pb={20}>
        {projectTitle}
      </Text>
      {errorMessage && <Text color="red">{errorMessage}</Text>}
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
        <Button onClick={submitTimer} color="red" mt="sm">
          Stop
        </Button>
      )}
    </Card>
  );
}
