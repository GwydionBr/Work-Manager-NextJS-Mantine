"use client";

import { IconCalendar, IconClock, IconFolder } from "@tabler/icons-react";
import { Accordion, Card, Group, ScrollArea, Text } from "@mantine/core";
import SessionRow from "@/components/Work/Session/SessionRow";
import type { Tables } from "@/types/db.types";

import * as helper from "@/utils/workHelperFunctions";
import { Currency } from "@/types/settings.types";
const Radius = 20;

interface SessionListProps {
  sessions: Tables<"timerSession">[];
}

export default function SessionList({ sessions }: SessionListProps) {
  const groupedSessions = groupSessions(sessions);

  return (
    <ScrollArea w="100%" pb="xl">
      {groupedSessions.length === 0 ? (
        <Text size="lg" c="gray">
          No Sessions
        </Text>
      ) : (
        groupedSessions.map(({ year, data: yearData }) => (
          // Year Section
          <Accordion
            key={year}
            variant="separated"
            pt={20}
            multiple
            defaultValue={[String(yearData.totalEarnings)]}
            radius={Radius}
          >
            <Accordion.Item value={String(yearData.totalEarnings)}>
              <Accordion.Control
                icon={<IconCalendar size={18} />}
                style={{ fontWeight: "bold" }}
              >
                <Group>
                  {year}
                  {yearData.totalEarnings.length > 0 && (
                    <Text size="sm" c="dimmed">
                      {formatEarnings(yearData.totalEarnings)}
                    </Text>
                  )}
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                {Object.entries(yearData.months).map(([month, monthData]) => (
                  // Month Section
                  <Accordion
                    key={month}
                    p={10}
                    variant="separated"
                    multiple
                    radius={Radius}
                  >
                    <Accordion.Item value={String(monthData.totalEarnings)}>
                      <Accordion.Control
                        icon={<IconFolder size={18} color="blue" />}
                      >
                        <Group>
                          {helper.formatMonth(Number(month))}
                          {monthData.totalEarnings.length > 0 && (
                            <Text size="sm" c="dimmed">
                              {formatEarnings(monthData.totalEarnings)}
                            </Text>
                          )}
                        </Group>
                      </Accordion.Control>
                      <Accordion.Panel>
                        {Object.entries(monthData.weeks).map(
                          ([week, weekData]) => (
                            // Week Section
                            <Accordion
                              key={week}
                              variant="separated"
                              multiple
                              radius={Radius}
                              p={5}
                            >
                              <Accordion.Item
                                value={String(weekData.totalEarnings)}
                              >
                                <Accordion.Control
                                  icon={
                                    <IconCalendar size={18} color="orange" />
                                  }
                                >
                                  <Group>
                                    Week {week}
                                    {weekData.totalEarnings.length > 0 && (
                                      <Text size="sm" c="dimmed">
                                        {formatEarnings(weekData.totalEarnings)}
                                      </Text>
                                    )}
                                  </Group>
                                </Accordion.Control>
                                <Accordion.Panel>
                                  {Object.entries(weekData.days).map(
                                    ([day, dayData]) => (
                                      // Day Section
                                      <Card
                                        key={day}
                                        withBorder
                                        shadow="sm"
                                        p="sm"
                                        m="xl"
                                        radius={Radius}
                                      >
                                        <Group>
                                          <IconClock size={16} color="green" />
                                          <Text>
                                            {helper.formatDate(new Date(day))}
                                          </Text>
                                          <Text>
                                            {formatEarnings(
                                              dayData.totalEarnings
                                            )}
                                          </Text>
                                        </Group>
                                        {dayData.sessions.map((session) => (
                                          <SessionRow
                                            key={session.id}
                                            session={session}
                                          />
                                        ))}
                                      </Card>
                                    )
                                  )}
                                </Accordion.Panel>
                              </Accordion.Item>
                            </Accordion>
                          )
                        )}
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

interface Earnings {
  amount: number;
  currency: Currency;
}

type Year = {
  totalEarnings: Earnings[];
  months: Record<
    number,
    {
      totalEarnings: Earnings[];
      weeks: Record<
        number,
        {
          totalEarnings: Earnings[];
          days: Record<
            string,
            {
              totalEarnings: Earnings[];
              sessions: Tables<"timerSession">[];
            }
          >;
        }
      >;
    }
  >;
};

function groupSessions(
  sessions: Tables<"timerSession">[]
): { year: number; data: Year }[] {
  const groupedSessions: Record<number, Year> = sessions.reduce(
    (acc, session) => {
      if (!session.start_time || !session.currency) {
        return acc;
      }

      const startTime = new Date(session.start_time);
      const year = startTime.getFullYear();
      const month = startTime.getMonth() + 1;
      const week = helper.getWeekNumber(startTime);
      const day = startTime.toISOString().split("T")[0];

      const earnings: Earnings = {
        amount: Number(
          ((session.active_seconds * session.salary) / 3600).toFixed(2)
        ),
        currency: session.currency,
      };

      // Year
      acc[year] = acc[year] || { totalEarnings: [], months: {} };
      acc[year].totalEarnings = addEarnings(acc[year].totalEarnings, earnings);

      // Month
      acc[year].months[month] = acc[year].months[month] || {
        totalEarnings: [],
        weeks: {},
      };
      acc[year].months[month].totalEarnings = addEarnings(
        acc[year].months[month].totalEarnings,
        earnings
      );

      // Week
      acc[year].months[month].weeks[week] = acc[year].months[month].weeks[
        week
      ] || {
        totalEarnings: [],
        days: {},
      };
      acc[year].months[month].weeks[week].totalEarnings = addEarnings(
        acc[year].months[month].weeks[week].totalEarnings,
        earnings
      );

      // Day
      acc[year].months[month].weeks[week].days[day] = acc[year].months[month]
        .weeks[week].days[day] || { totalEarnings: [], sessions: [] };
      acc[year].months[month].weeks[week].days[day].totalEarnings = addEarnings(
        acc[year].months[month].weeks[week].days[day].totalEarnings,
        earnings
      );
      acc[year].months[month].weeks[week].days[day].sessions.push(session);

      return acc;
    },
    {} as Record<number, Year>
  );

  return Object.entries(groupedSessions).map(([year, data]) => ({
    year: Number(year),
    data,
  }));
}

function addEarnings(
  existingEarnings: Earnings[],
  newEarnings: Earnings
): Earnings[] {
  const updatedEarnings = [...existingEarnings]; // Neue Kopie des Arrays erstellen
  const existingIndex = updatedEarnings.findIndex(
    (e) => e.currency === newEarnings.currency
  );

  if (existingIndex > -1) {
    updatedEarnings[existingIndex] = {
      ...updatedEarnings[existingIndex],
      amount: updatedEarnings[existingIndex].amount + newEarnings.amount,
    };
  } else {
    updatedEarnings.push({ ...newEarnings });
  }

  return updatedEarnings;
}

function formatEarnings(earnings: Earnings[]): string {
  return earnings
    .map((e) => {
      const shortCurrency = helper.getCurrencySymbol(e.currency);
      return helper.formatEarningsAmount(e.amount, shortCurrency);
    })
    .join(", ");
}
