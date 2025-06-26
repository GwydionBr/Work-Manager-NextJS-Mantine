"use client";

import { useState } from "react";
import {
  Accordion,
  Group,
  ScrollArea,
  Text,
  Checkbox,
  Stack,
  Button,
} from "@mantine/core";
import { IconCalendar, IconClock, IconFolder } from "@tabler/icons-react";
import SessionRow from "@/components/Work/Session/SessionRow";

import * as helper from "@/utils/workHelperFunctions";

import type { Tables } from "@/types/db.types";
import { Currency } from "@/types/settings.types";

const Radius = 20;

interface SessionListProps {
  sessions: Tables<"timerSession">[];
  projects?: Tables<"timerProject">[];
  selectedSessions?: string[];
  onSessionsChange?: (sessions: string[]) => void;
  project?: Tables<"timerProject">;
  isOverview?: boolean;
}

export default function SessionList({
  sessions,
  projects,
  selectedSessions: externalSelectedSessions,
  onSessionsChange,
  project,
  isOverview = false,
}: SessionListProps) {
  const [internalSelectedSessions, setInternalSelectedSessions] = useState<
    string[]
  >([]);
  const groupedSessions = groupSessions(sessions);

  // Use external state if provided, otherwise use internal state
  const selectedSessions = externalSelectedSessions || internalSelectedSessions;
  const setSelectedSessions = onSessionsChange || setInternalSelectedSessions;

  // Only show selection controls for hourly payment projects
  const showSelectionControls = project?.hourly_payment || isOverview;

  // Filter out paid sessions for selection
  const unpaidSessions = sessions.filter((session) => {
    if (isOverview) {
      // In overview mode, we need to find the project for each session
      const sessionProject = projects?.find((p) => p.id === session.project_id);
      if (!sessionProject) return false;

      // For hourly payment projects, check if session is paid
      if (sessionProject.hourly_payment) {
        return !session.payed;
      }

      // For non-hourly payment projects, check if project is fully paid
      const projectTotalPayout = sessionProject.total_payout || 0;
      return projectTotalPayout < sessionProject.salary;
    }

    // Normal mode - just check session.payed
    return !session.payed;
  });

  const handleSessionToggle = (sessionId: string) => {
    if (!showSelectionControls) return;

    if (onSessionsChange) {
      // External state management
      onSessionsChange(
        selectedSessions.includes(sessionId)
          ? selectedSessions.filter((id) => id !== sessionId)
          : [...selectedSessions, sessionId]
      );
    } else {
      // Internal state management
      setInternalSelectedSessions((prev) =>
        prev.includes(sessionId)
          ? prev.filter((id) => id !== sessionId)
          : [...prev, sessionId]
      );
    }
  };

  const handleSelectAll = () => {
    if (!showSelectionControls) return;

    if (onSessionsChange) {
      // External state management
      if (selectedSessions.length === unpaidSessions.length) {
        onSessionsChange([]);
      } else {
        onSessionsChange(unpaidSessions.map((s) => s.id));
      }
    } else {
      // Internal state management
      if (internalSelectedSessions.length === unpaidSessions.length) {
        setInternalSelectedSessions([]);
      } else {
        setInternalSelectedSessions(unpaidSessions.map((s) => s.id));
      }
    }
  };

  const renderTime = (seconds: number) => (
    <Text
      size="sm"
      c="light-dark(var(--mantine-color-blue-9), var(--mantine-color-blue-4))"
    >
      {formatTime(seconds)}
    </Text>
  );

  const renderEarnings = (earnings: EarningsBreakdown) => (
    <Group gap="xs">
      {!areEarningsEmpty(earnings.unpaid) && (
        <Text size="sm" c="red">
          {formatEarnings(earnings.unpaid)} unpaid
        </Text>
      )}
      {!areEarningsEmpty(earnings.paid) && (
        <Text size="sm" c="green">
          {formatEarnings(earnings.paid)} paid
        </Text>
      )}
    </Group>
  );

  const areEarningsEmpty = (earnings: Earnings[]) => {
    return earnings.every((e) => e.amount === 0);
  };

  const areEarningsBreakdownEmpty = (earnings: EarningsBreakdown) => {
    return areEarningsEmpty(earnings.paid) && areEarningsEmpty(earnings.unpaid);
  };

  return (
    <ScrollArea w="100%" pb="xl">
      {groupedSessions.length === 0 ? (
        <Text size="lg" c="gray" ta="center">
          Add as Session to see it here
        </Text>
      ) : (
        <>
          {/* Bulk Selection Controls */}
          {showSelectionControls && (
            <Stack
              mb="md"
              p="md"
              bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))"
              style={{ borderRadius: Radius }}
            >
              <Group justify="space-between">
                <Checkbox
                  label={`Select All (${unpaidSessions.length} unpaid sessions)`}
                  checked={
                    selectedSessions.length === unpaidSessions.length &&
                    unpaidSessions.length > 0
                  }
                  indeterminate={
                    selectedSessions.length > 0 &&
                    selectedSessions.length < unpaidSessions.length
                  }
                  onChange={handleSelectAll}
                  disabled={unpaidSessions.length === 0}
                />
                {selectedSessions.length > 0 && (
                  <Text size="sm" c="dimmed">
                    {selectedSessions.length} session
                    {selectedSessions.length > 1 ? "s" : ""} selected
                  </Text>
                )}
                {unpaidSessions.length === 0 && (
                  <Text size="sm" c="dimmed">
                    All sessions paid
                  </Text>
                )}
              </Group>
            </Stack>
          )}

          {groupedSessions.reverse().map(({ year, data: yearData }, index) => (
            // Year Section
            <Accordion
              key={year}
              variant="separated"
              pt={20}
              multiple
              defaultValue={index === 0 ? [String(yearData.totalEarnings)] : []}
              radius={Radius}
            >
              <Accordion.Item value={String(yearData.totalEarnings)}>
                <Accordion.Control
                  icon={<IconCalendar size={18} />}
                  style={{ fontWeight: "bold" }}
                >
                  <Group>
                    {year}
                    {!areEarningsBreakdownEmpty(yearData.totalEarnings) &&
                      renderEarnings(yearData.totalEarnings)}
                    {yearData.totalTime > 0 && renderTime(yearData.totalTime)}
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  {Object.entries(yearData.months)
                    .reverse()
                    .map(([month, monthData], index) => (
                      // Month Section
                      <Accordion
                        key={month}
                        p={10}
                        variant="separated"
                        multiple
                        radius={Radius}
                        defaultValue={
                          index === 0 ? [String(monthData.totalEarnings)] : []
                        }
                      >
                        <Accordion.Item value={String(monthData.totalEarnings)}>
                          <Accordion.Control
                            icon={<IconFolder size={18} color="blue" />}
                          >
                            <Group>
                              {helper.formatMonth(Number(month))}
                              {!areEarningsBreakdownEmpty(
                                monthData.totalEarnings
                              ) && renderEarnings(monthData.totalEarnings)}
                              {monthData.totalTime > 0 &&
                                renderTime(monthData.totalTime)}
                            </Group>
                          </Accordion.Control>
                          <Accordion.Panel>
                            {Object.entries(monthData.weeks)
                              .reverse()
                              .map(([week, weekData], index) => (
                                // Week Section
                                <Accordion
                                  key={week}
                                  variant="separated"
                                  multiple
                                  radius={Radius}
                                  p={5}
                                  defaultValue={
                                    index === 0
                                      ? [String(weekData.totalEarnings)]
                                      : []
                                  }
                                >
                                  <Accordion.Item
                                    value={String(weekData.totalEarnings)}
                                  >
                                    <Accordion.Control
                                      icon={
                                        <IconCalendar
                                          size={18}
                                          color="orange"
                                        />
                                      }
                                    >
                                      <Group>
                                        Week {week}
                                        {!areEarningsBreakdownEmpty(
                                          weekData.totalEarnings
                                        ) &&
                                          renderEarnings(
                                            weekData.totalEarnings
                                          )}
                                        {weekData.totalTime > 0 &&
                                          renderTime(weekData.totalTime)}
                                      </Group>
                                    </Accordion.Control>
                                    <Accordion.Panel>
                                      {Object.entries(weekData.days)
                                        .sort(([dayA], [dayB]) =>
                                          dayA.localeCompare(dayB)
                                        )
                                        .reverse()
                                        .map(([day, dayData], index) => (
                                          // Day Section
                                          <Accordion
                                            key={day}
                                            variant="separated"
                                            multiple
                                            radius={Radius}
                                            p={5}
                                            defaultValue={
                                              index === 0
                                                ? [
                                                    String(
                                                      dayData.totalEarnings
                                                    ),
                                                  ]
                                                : []
                                            }
                                          >
                                            <Accordion.Item value={day}>
                                              <Accordion.Control
                                                icon={
                                                  <IconClock
                                                    size={18}
                                                    color="green"
                                                  />
                                                }
                                              >
                                                <Group>
                                                  {helper.formatDate(
                                                    new Date(day)
                                                  )}
                                                  {!areEarningsBreakdownEmpty(
                                                    dayData.totalEarnings
                                                  ) &&
                                                    renderEarnings(
                                                      dayData.totalEarnings
                                                    )}
                                                  {dayData.totalTime > 0 &&
                                                    renderTime(
                                                      dayData.totalTime
                                                    )}
                                                </Group>
                                              </Accordion.Control>
                                              <Accordion.Panel>
                                                {dayData.sessions
                                                  .reverse()
                                                  .map((session) => (
                                                    <SessionRow
                                                      key={session.id}
                                                      session={session}
                                                      project={
                                                        project ||
                                                        projects?.find(
                                                          (p) =>
                                                            p.id ===
                                                            session.project_id
                                                        )
                                                      }
                                                      isSelected={selectedSessions.includes(
                                                        session.id
                                                      )}
                                                      onToggleSelection={() =>
                                                        handleSessionToggle(
                                                          session.id
                                                        )
                                                      }
                                                      isOverview={isOverview}
                                                    />
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
                    ))}
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          ))}
        </>
      )}
    </ScrollArea>
  );
}

interface Earnings {
  amount: number;
  currency: Currency;
}

interface EarningsBreakdown {
  paid: Earnings[];
  unpaid: Earnings[];
}

type Year = {
  totalEarnings: EarningsBreakdown;
  totalTime: number;
  months: Record<
    number,
    {
      totalEarnings: EarningsBreakdown;
      totalTime: number;
      weeks: Record<
        number,
        {
          totalEarnings: EarningsBreakdown;
          totalTime: number;
          days: Record<
            string,
            {
              totalEarnings: EarningsBreakdown;
              totalTime: number;
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

      // Calculate earnings for all sessions (both paid and unpaid)
      const earnings: Earnings = {
        amount: session.hourly_payment
          ? Number(
              ((session.active_seconds * session.salary) / 3600).toFixed(2)
            )
          : 0,
        currency: session.currency,
      };

      const timeInSeconds = session.active_seconds || 0;

      // Year
      acc[year] = acc[year] || {
        totalEarnings: { paid: [], unpaid: [] },
        totalTime: 0,
        months: {},
      };

      if (session.payed) {
        acc[year].totalEarnings.paid = addEarnings(
          acc[year].totalEarnings.paid,
          earnings
        );
      } else {
        acc[year].totalEarnings.unpaid = addEarnings(
          acc[year].totalEarnings.unpaid,
          earnings
        );
      }
      acc[year].totalTime += timeInSeconds;

      // Month
      acc[year].months[month] = acc[year].months[month] || {
        totalEarnings: { paid: [], unpaid: [] },
        totalTime: 0,
        weeks: {},
      };

      if (session.payed) {
        acc[year].months[month].totalEarnings.paid = addEarnings(
          acc[year].months[month].totalEarnings.paid,
          earnings
        );
      } else {
        acc[year].months[month].totalEarnings.unpaid = addEarnings(
          acc[year].months[month].totalEarnings.unpaid,
          earnings
        );
      }
      acc[year].months[month].totalTime += timeInSeconds;

      // Week
      acc[year].months[month].weeks[week] = acc[year].months[month].weeks[
        week
      ] || {
        totalEarnings: { paid: [], unpaid: [] },
        totalTime: 0,
        days: {},
      };

      if (session.payed) {
        acc[year].months[month].weeks[week].totalEarnings.paid = addEarnings(
          acc[year].months[month].weeks[week].totalEarnings.paid,
          earnings
        );
      } else {
        acc[year].months[month].weeks[week].totalEarnings.unpaid = addEarnings(
          acc[year].months[month].weeks[week].totalEarnings.unpaid,
          earnings
        );
      }
      acc[year].months[month].weeks[week].totalTime += timeInSeconds;

      // Day
      acc[year].months[month].weeks[week].days[day] = acc[year].months[month]
        .weeks[week].days[day] || {
        totalEarnings: { paid: [], unpaid: [] },
        totalTime: 0,
        sessions: [],
      };

      if (session.payed) {
        acc[year].months[month].weeks[week].days[day].totalEarnings.paid =
          addEarnings(
            acc[year].months[month].weeks[week].days[day].totalEarnings.paid,
            earnings
          );
      } else {
        acc[year].months[month].weeks[week].days[day].totalEarnings.unpaid =
          addEarnings(
            acc[year].months[month].weeks[week].days[day].totalEarnings.unpaid,
            earnings
          );
      }
      acc[year].months[month].weeks[week].days[day].totalTime += timeInSeconds;
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

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours} h`;
  } else {
    return `${minutes} min`;
  }
}
