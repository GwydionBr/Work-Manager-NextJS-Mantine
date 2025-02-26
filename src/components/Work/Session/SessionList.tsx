'use client';

import { IconCalendar, IconClock, IconFolder } from '@tabler/icons-react';
import { Accordion, Card, Group, ScrollArea, Text } from '@mantine/core';
import type { Tables } from '@/types/db.types';
import SessionRow from '@/components/Work/Session/SessionRow';
import { useWorkStore } from '@/stores/workManagerStore';


export default function SessionList() {
  const { activeProject } = useWorkStore();

  const groupedSessions = groupSessions(activeProject ? activeProject.sessions : []);

  return (
    <ScrollArea>
      {Object.keys(groupedSessions).length === 0 ? (
        <Text size="lg" color="gray">
          No Sessions
        </Text>
      ) : (
        Object.entries(groupedSessions)
          .sort(([a], [b]) => Number(b) - Number(a))
          .map(([year, months]) => (
            <Accordion
              key={year}
              variant="separated"
              p={20}
              style={{ width: '55vw' }}
              multiple
              defaultValue={[year]}
            >
              <Accordion.Item value={year}>
                <Accordion.Control icon={<IconCalendar size={18} />} style={{ fontWeight: 'bold' }}>
                  {year}
                </Accordion.Control>
                <Accordion.Panel>
                  {Object.entries(months)
                    .sort(([a], [b]) => Number(b) - Number(a))
                    .map(([month, weeks]) => (
                      <Accordion
                        key={month}
                        variant="separated"
                        multiple
                        defaultValue={[String(month)]}
                      >
                        <Accordion.Item value={String(month)}>
                          <Accordion.Control icon={<IconFolder size={18} color="blue" />}>
                            {formatMonth(Number(month))}
                          </Accordion.Control>
                          <Accordion.Panel>
                            {Object.entries(weeks)
                              .sort(([a], [b]) => Number(b) - Number(a))
                              .map(([week, days]) => (
                                <Accordion
                                  key={week}
                                  variant="separated"
                                  multiple
                                  defaultValue={[String(week)]}
                                >
                                  <Accordion.Item value={String(week)}>
                                    <Accordion.Control
                                      icon={<IconCalendar size={18} color="orange" />}
                                    >
                                      Week {week}
                                    </Accordion.Control>
                                    <Accordion.Panel>
                                      {Object.entries(days)
                                        .sort(
                                          ([a], [b]) =>
                                            new Date(b).getTime() - new Date(a).getTime()
                                        )
                                        .map(([day, sessions]) => (
                                          <Card key={day} withBorder shadow="sm" p="sm" m="sm">
                                            <Group>
                                              <IconClock size={16} color="green" />
                                              <Text>{formatDate(new Date(day))}</Text>
                                            </Group>
                                            {sessions.map((session) => (
                                              <SessionRow key={session.id} session={session} />
                                            ))}
                                          </Card>
                                        ))}
                                    </Accordion.Panel>
                                  </Accordion.Item>
                                </Accordion>
                              ))}
                          </Accordion.Panel>
                        </Accordion.Item>
                      </Accordion>
                    ))}
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          ))
      )}
    </ScrollArea>
  );
}

// 🔹 Hilfsfunktionen zur Gruppierung
function groupSessions(sessions: Tables<'timerSession'>[]) {
  return sessions.reduce(
    (acc, session) => {
      if (!session.start_time) {
        return acc;
      }
      const startTime = new Date(session.start_time);
      const year = startTime.getFullYear();
      const month = startTime.getMonth() + 1;
      const week = getWeekNumber(startTime);
      const day = startTime.toISOString().split('T')[0];

      acc[year] = acc[year] || {};
      acc[year][month] = acc[year][month] || {};
      acc[year][month][week] = acc[year][month][week] || {};
      acc[year][month][week][day] = acc[year][month][week][day] || [];
      acc[year][month][week][day].push(session);

      return acc;
    },
    {} as Record<number, Record<number, Record<number, Record<string, Tables<'timerSession'>[]>>>>
  );
}

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatMonth(month: number) {
  return new Date(2023, month - 1, 1).toLocaleString(undefined, { month: 'long' });
}

function getWeekNumber(date: Date) {
  const firstJan = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - firstJan.getTime();
  return Math.ceil((diff / (1000 * 60 * 60 * 24) + firstJan.getDay() + 1) / 7);
}
