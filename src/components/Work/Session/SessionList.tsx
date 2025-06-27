"use client";

import { useState, useMemo } from "react";
import {
  Accordion,
  Group,
  ScrollArea,
  Text,
  Checkbox,
  Stack,
  Button,
  Select,
  Divider,
  Slider,
  Badge,
} from "@mantine/core";
import { IconCalendar, IconClock, IconFolder } from "@tabler/icons-react";
import SessionRow from "@/components/Work/Session/SessionRow";

import * as helper from "@/utils/workHelperFunctions";
import { useFinanceStore } from "@/stores/financeStore";

import type { Tables } from "@/types/db.types";
import { Currency } from "@/types/settings.types";

const Radius = 20;

interface SessionListProps {
  sessions: Tables<"timerSession">[];
  projects?: Tables<"timerProject">[];
  folders?: Tables<"timer_project_folder">[];
  selectedSessions?: string[];
  onSessionsChange?: (sessions: string[]) => void;
  project?: Tables<"timerProject">;
  isOverview?: boolean;
}

export default function SessionList({
  sessions,
  projects,
  folders,
  selectedSessions: externalSelectedSessions,
  onSessionsChange,
  project,
  isOverview = false,
}: SessionListProps) {
  const [internalSelectedSessions, setInternalSelectedSessions] = useState<
    string[]
  >([]);
  const [timeFilterDays, setTimeFilterDays] = useState<number>(7);
  const [selectedTimePreset, setSelectedTimePreset] = useState<string | null>(
    null
  );
  const { financeCategories } = useFinanceStore();

  // Preset time periods
  const timePresets = useMemo(
    () => [
      { value: "today", label: "Today", days: 1 },
      { value: "yesterday", label: "Yesterday", days: 1 },
      { value: "last3days", label: "Last 3 days", days: 3 },
      { value: "last7days", label: "Last 7 days", days: 7 },
      { value: "last14days", label: "Last 14 days", days: 14 },
      { value: "last30days", label: "Last 30 days", days: 30 },
      { value: "last90days", label: "Last 90 days", days: 90 },
      {
        value: "custom",
        label: `Last ${timeFilterDays} days`,
        days: timeFilterDays,
      },
    ],
    [timeFilterDays]
  );

  // Use external state if provided, otherwise use internal state
  const selectedSessions = externalSelectedSessions || internalSelectedSessions;
  const setSelectedSessions = onSessionsChange || setInternalSelectedSessions;

  // Only show selection controls for hourly payment projects
  const showSelectionControls = project?.hourly_payment || isOverview;

  // Filter sessions by time period
  const getFilteredSessions = () => {
    if (!selectedTimePreset || isOverview) {
      return sessions;
    }

    const now = new Date();
    const preset = timePresets.find((p) => p.value === selectedTimePreset);
    if (!preset) return sessions;

    let startDate: Date;
    let endDate: Date;

    switch (selectedTimePreset) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1
        );
        break;
      case "yesterday":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 1
        );
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      default:
        // For custom and other periods, go back X days from today
        startDate = new Date(now.getTime() - preset.days * 24 * 60 * 60 * 1000);
        endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1
        );
        break;
    }

    return sessions.filter((session) => {
      if (!session.start_time) return false;
      const sessionDate = new Date(session.start_time);
      return sessionDate >= startDate && sessionDate < endDate;
    });
  };

  const filteredSessions = getFilteredSessions();
  const groupedSessions = groupSessions(sessions); // Use original sessions for display

  // Filter out paid sessions for selection
  const unpaidSessions = filteredSessions.filter((session) => {
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

  const handleSelectByProject = (projectId: string | null) => {
    if (!showSelectionControls || !projectId) return;

    const projectSessions = unpaidSessions.filter(
      (session) => session.project_id === projectId
    );
    const projectSessionIds = projectSessions.map((s) => s.id);

    if (onSessionsChange) {
      // External state management
      const newSelectedSessions = selectedSessions.filter(
        (id) => !projectSessionIds.includes(id)
      );
      onSessionsChange([...newSelectedSessions, ...projectSessionIds]);
    } else {
      // Internal state management
      const newSelectedSessions = internalSelectedSessions.filter(
        (id) => !projectSessionIds.includes(id)
      );
      setInternalSelectedSessions([
        ...newSelectedSessions,
        ...projectSessionIds,
      ]);
    }
  };

  const handleSelectByCategory = (categoryId: string | null) => {
    if (!showSelectionControls || !categoryId || !projects) return;

    const categoryProjects = projects.filter(
      (project) => project.folder_id === categoryId
    );
    const categoryProjectIds = categoryProjects.map((p) => p.id);
    const categorySessions = unpaidSessions.filter((session) =>
      categoryProjectIds.includes(session.project_id)
    );
    const categorySessionIds = categorySessions.map((s) => s.id);

    if (onSessionsChange) {
      // External state management
      const newSelectedSessions = selectedSessions.filter(
        (id) => !categorySessionIds.includes(id)
      );
      onSessionsChange([...newSelectedSessions, ...categorySessionIds]);
    } else {
      // Internal state management
      const newSelectedSessions = internalSelectedSessions.filter(
        (id) => !categorySessionIds.includes(id)
      );
      setInternalSelectedSessions([
        ...newSelectedSessions,
        ...categorySessionIds,
      ]);
    }
  };

  const handleSelectByCashFlowCategory = (
    cashFlowCategoryId: string | null
  ) => {
    if (!showSelectionControls || !cashFlowCategoryId || !projects) return;

    const cashFlowCategoryProjects = projects.filter(
      (project) => project.cash_flow_category_id === cashFlowCategoryId
    );
    const cashFlowCategoryProjectIds = cashFlowCategoryProjects.map(
      (p) => p.id
    );
    const cashFlowCategorySessions = unpaidSessions.filter((session) =>
      cashFlowCategoryProjectIds.includes(session.project_id)
    );
    const cashFlowCategorySessionIds = cashFlowCategorySessions.map(
      (s) => s.id
    );

    if (onSessionsChange) {
      // External state management
      const newSelectedSessions = selectedSessions.filter(
        (id) => !cashFlowCategorySessionIds.includes(id)
      );
      onSessionsChange([...newSelectedSessions, ...cashFlowCategorySessionIds]);
    } else {
      // Internal state management
      const newSelectedSessions = internalSelectedSessions.filter(
        (id) => !cashFlowCategorySessionIds.includes(id)
      );
      setInternalSelectedSessions([
        ...newSelectedSessions,
        ...cashFlowCategorySessionIds,
      ]);
    }
  };

  const handleTimePresetChange = (preset: string | null) => {
    setSelectedTimePreset(preset);
    if (preset && preset !== "custom") {
      const presetData = timePresets.find((p) => p.value === preset);
      if (presetData) {
        setTimeFilterDays(presetData.days);
      }
    }
  };

  const handleCustomDaysChange = (days: number) => {
    setTimeFilterDays(days);
    setSelectedTimePreset("custom");
  };

  const handleSelectByTimePeriod = () => {
    if (!selectedTimePreset) return;

    const timePeriodSessions = filteredSessions.filter(
      (session) => !session.payed
    );
    const timePeriodSessionIds = timePeriodSessions.map((s) => s.id);

    if (onSessionsChange) {
      // External state management
      const newSelectedSessions = selectedSessions.filter(
        (id) => !timePeriodSessionIds.includes(id)
      );
      onSessionsChange([...newSelectedSessions, ...timePeriodSessionIds]);
    } else {
      // Internal state management
      const newSelectedSessions = internalSelectedSessions.filter(
        (id) => !timePeriodSessionIds.includes(id)
      );
      setInternalSelectedSessions([
        ...newSelectedSessions,
        ...timePeriodSessionIds,
      ]);
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
        <Text size="sm" c="dimmed">
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

  // Get unique categories and projects for selection dropdowns
  const getCategories = () => {
    if (!projects || !folders) return [];

    const categories = new Map<string, { id: string; title: string }>();

    // Get categories from projects that have folder_id
    projects.forEach((project) => {
      if (project.folder_id) {
        const folder = folders.find((f) => f.id === project.folder_id);
        if (folder) {
          categories.set(project.folder_id, {
            id: project.folder_id,
            title: folder.title,
          });
        }
      }
    });

    return Array.from(categories.values());
  };

  const getProjects = () => {
    if (!projects) return [];

    return projects.map((project) => ({
      value: project.id,
      label: project.title,
    }));
  };

  const getCashFlowCategories = () => {
    if (!financeCategories) return [];

    return financeCategories.map((category) => ({
      value: category.id,
      label: category.title,
    }));
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
              <Group justify="space-between" align="flex-start">
                <Stack gap="xs" style={{ flex: 1 }}>
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

                  {/* Time Period Filtering for normal projects */}
                  {!isOverview && (
                    <>
                      <Divider my="xs" />
                      <Stack gap="xs">
                        <Text size="sm" fw={500}>
                          Select Sessions by Time Period
                        </Text>
                        <Group gap="md" align="flex-end">
                          <Select
                            label="Time Period"
                            placeholder="Select a time period"
                            data={timePresets.map((preset) => ({
                              value: preset.value,
                              label: preset.label,
                            }))}
                            value={selectedTimePreset}
                            onChange={handleTimePresetChange}
                            clearable
                            style={{ flex: 1 }}
                          />
                          {selectedTimePreset && (
                            <Button
                              size="sm"
                              onClick={handleSelectByTimePeriod}
                              variant="light"
                            >
                              Select{" "}
                              {filteredSessions.filter((s) => !s.payed).length}{" "}
                              unpaid sessions
                            </Button>
                          )}
                        </Group>
                        {selectedTimePreset === "custom" && (
                          <Stack gap="xs">
                            <Text size="sm">Custom Days: {timeFilterDays}</Text>
                            <Slider
                              value={timeFilterDays}
                              onChange={handleCustomDaysChange}
                              min={1}
                              max={365}
                              step={1}
                              marks={[
                                { value: 1, label: "1" },
                                { value: 7, label: "7" },
                                { value: 30, label: "30" },
                                { value: 90, label: "90" },
                                { value: 365, label: "365" },
                              ]}
                            />
                          </Stack>
                        )}
                        {selectedTimePreset &&
                          selectedTimePreset !== "custom" && (
                            <Badge color="blue" variant="light">
                              {filteredSessions.filter((s) => !s.payed).length}{" "}
                              unpaid sessions in selected period
                            </Badge>
                          )}
                        {selectedTimePreset === "custom" && (
                          <Badge color="blue" variant="light">
                            {filteredSessions.filter((s) => !s.payed).length}{" "}
                            unpaid sessions in last {timeFilterDays} days
                          </Badge>
                        )}
                      </Stack>
                    </>
                  )}

                  {isOverview && projects && projects.length > 0 && (
                    <>
                      <Divider my="xs" />
                      <Group gap="md" align="flex-end">
                        <Select
                          label="Select by Folder"
                          placeholder="Choose a folder"
                          data={getCategories().map((cat) => ({
                            value: cat.id,
                            label: cat.title,
                          }))}
                          onChange={handleSelectByCategory}
                          clearable
                          style={{ flex: 1 }}
                        />
                        <Select
                          label="Select by Project"
                          placeholder="Choose a project"
                          data={getProjects()}
                          onChange={handleSelectByProject}
                          clearable
                          style={{ flex: 1 }}
                        />
                        <Select
                          label="Select by Category"
                          placeholder="Choose a category"
                          data={getCashFlowCategories()}
                          onChange={handleSelectByCashFlowCategory}
                          clearable
                          style={{ flex: 1 }}
                        />
                      </Group>
                    </>
                  )}
                </Stack>

                <Stack gap="xs" align="flex-end">
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
                </Stack>
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
