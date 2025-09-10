"use client";

import { useSettingsStore } from "@/stores/settingsStore";

import { Accordion, Box, Group, Text } from "@mantine/core";
import { IconCalendar, IconClock, IconFolder } from "@tabler/icons-react";
import SessionRow from "@/components/Work/Session/SessionRow";
import {
  formatTime,
  areEarningsBreakdownEmpty,
} from "@/utils/sessionHelperFunctions";
import { formatDate, formatMoney, formatMonth } from "@/utils/formatFunctions";

import type { Tables } from "@/types/db.types";
import type { EarningsBreakdown, Year } from "@/types/timerSession.types";

const Radius = 20;

interface SessionHierarchyProps {
  groupedSessions: { year: number; data: Year }[];
  selectedSessions: string[];
  onSessionToggle: (sessionId: string, index: number, range: boolean) => void;
  project?: Tables<"timer_project">;
  projects?: Tables<"timer_project">[];
  isOverview: boolean;
  selectedModeActive: boolean;
}

export default function SessionHierarchy({
  groupedSessions,
  selectedSessions,
  onSessionToggle,
  project,
  projects,
  isOverview,
  selectedModeActive,
}: SessionHierarchyProps) {
  const { locale } = useSettingsStore();

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
      {!areEarningsBreakdownEmpty(earnings) && (
        <Group gap="xs">
          {earnings.unpaid.some((e) => e.amount > 0) && (
            <Text size="sm" c="red">
              {earnings.unpaid
                .map((e) => formatMoney(e.amount, e.currency, locale))
                .join(" ") + " "}
              {locale === "de-DE" ? "unbezahlt" : "unpaid"}
            </Text>
          )}
          {earnings.paid.some((e) => e.amount > 0) && (
            <Text size="sm" c="dimmed">
              {earnings.paid
                .map((e) => formatMoney(e.amount, e.currency, locale))
                .join(" ") + " "}
              {locale === "de-DE" ? "bezahlt" : "paid"}
            </Text>
          )}
        </Group>
      )}
    </Group>
  );

  return (
    <Box>
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
                          {formatMonth(Number(month), locale)}
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
                                    <IconCalendar size={18} color="orange" />
                                  }
                                >
                                  <Group>
                                    {locale === "de-DE"
                                      ? `${week}. Woche`
                                      : `Week ${week}`}
                                    {!areEarningsBreakdownEmpty(
                                      weekData.totalEarnings
                                    ) && renderEarnings(weekData.totalEarnings)}
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
                                            ? [String(dayData.totalEarnings)]
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
                                              {formatDate(
                                                new Date(day),
                                                locale
                                              )}
                                              {!areEarningsBreakdownEmpty(
                                                dayData.totalEarnings
                                              ) &&
                                                renderEarnings(
                                                  dayData.totalEarnings
                                                )}
                                              {dayData.totalTime > 0 &&
                                                renderTime(dayData.totalTime)}
                                            </Group>
                                          </Accordion.Control>
                                          <Accordion.Panel>
                                            {dayData.sessions
                                              .sort(
                                                (a, b) =>
                                                  new Date(
                                                    a.start_time
                                                  ).getTime() -
                                                  new Date(
                                                    b.start_time
                                                  ).getTime()
                                              )
                                              .reverse()
                                              .map((session) => (
                                                <SessionRow
                                                  selectedModeActive={
                                                    selectedModeActive
                                                  }
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
                                                  onToggleSelected={(e) =>
                                                    onSessionToggle(
                                                      session.id,
                                                      session.index,
                                                      e.shiftKey
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
    </Box>
  );
}
