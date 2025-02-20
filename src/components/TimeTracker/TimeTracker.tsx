'use client';

import { useEffect } from 'react';
import { Button, Card, Text } from '@mantine/core';
import { useTimeTracker } from '@/store/timeTracker'; 
import { Tables } from '@/db.types';

interface TimeTrackerProps {
  project: Tables<'timerProject'> | null;
}

export default function TimeTrackerComponent({ project }: TimeTrackerProps) {
  const {
    moneyEarned,
    activeTime,
    pausedTime,
    state,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    configureProject,
  } = useTimeTracker();

  useEffect(() => {
    if (project) {
      configureProject(project.id, project.title, project.currency || "$", project.salary);
    }
  }, [project]);

  if (!project) {
    return null;
  }



  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Text size="xl" pb={20}>
        {project.title}
      </Text>
      <Text size="lg">💰 Geld verdient: {moneyEarned} $</Text>
      <Text>⏱ Aktive Zeit: {activeTime}</Text>
      <Text>⏸ Pausierte Zeit: {pausedTime}</Text>
      <Text>📌 Status: {state}</Text>

      <Button onClick={startTimer} disabled={state !== 'stopped'} color="green" mt="sm">
        Start
      </Button>
      <Button onClick={pauseTimer} disabled={state !== 'running'} color="yellow" mt="sm">
        Pause
      </Button>
      <Button onClick={resumeTimer} disabled={state !== 'paused'} color="blue" mt="sm">
        Weiter
      </Button>
      <Button onClick={stopTimer} disabled={state === 'stopped'} color="red" mt="sm">
        Stop
      </Button>
    </Card>
  );
}
