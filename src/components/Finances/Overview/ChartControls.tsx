"use client";

import { useDisclosure } from "@mantine/hooks";
import { useState, useMemo } from "react";

import {
  Group,
  Select,
  Switch,
  Button,
  Stack,
  Card,
  Collapse,
  Text,
  ActionIcon,
  Tooltip,
  SegmentedControl,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import {
  IconChartArea,
  IconChartBar,
  IconChartLine,
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconFilter,
} from "@tabler/icons-react";
import { financeIntervals } from "@/constants/settings";
import { type DateRange } from "@/hooks/useFinanceChartData";
import { type FinanceInterval } from "@/types/settings.types";
import React from "react";
import FilterActionIcon from "@/components/UI/Buttons/FilterActionIcon";

/**
 * Available chart visualization types
 */
export type ChartType = "area" | "bar" | "line";

/**
 * Navigation mode for date selection
 */
export type NavigationMode = "month" | "quarter" | "year" | "custom";

/**
 * Props for the ChartControlSection component
 */
interface ChartControlsProps {
  interval: FinanceInterval;
  setInterval: (interval: FinanceInterval) => void;
  chartType: ChartType;
  setChartType: (chartType: ChartType) => void;
  showNet: boolean;
  setShowNet: (showNet: boolean) => void;
  dateRange: DateRange;
  setDateRange: (dateRange: DateRange) => void;
  useCustomRange: boolean;
  setUseCustomRange: (useCustomRange: boolean) => void;
}

/**
 * Chart Control Section Component
 *
 * Provides controls for:
 * - Smart time period selection with navigation
 * - Chart type selection (area, bar, line)
 * - Net display toggle
 * - Custom date range selection with preset buttons
 */
export default function ChartControls({
  interval,
  setInterval,
  chartType,
  setChartType,
  showNet,
  setShowNet,
  dateRange,
  setDateRange,
  useCustomRange,
  setUseCustomRange,
}: ChartControlsProps) {
  const [filterOpen, { toggle }] = useDisclosure(false);
  const [navigationMode, setNavigationMode] = useState<NavigationMode>("month");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Chart type options for the dropdown
  const chartTypeOptions = [
    { value: "area", label: "Area", icon: IconChartArea },
    { value: "bar", label: "Bar", icon: IconChartBar },
    { value: "line", label: "Line", icon: IconChartLine },
  ];

  /**
   * Get the display title for the current navigation mode and date
   */
  const getNavigationTitle = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    switch (navigationMode) {
      case "month":
        return new Date(year, month).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
      case "quarter":
        const quarter = Math.floor(month / 3) + 1;
        return `Q${quarter} ${year}`;
      case "year":
        return year.toString();
      case "custom":
        return "Custom";
      default:
        return "";
    }
  }, [navigationMode, currentDate]);

  /**
   * Navigate to previous period
   */
  const navigatePrevious = () => {
    const newDate = new Date(currentDate);

    switch (navigationMode) {
      case "month":
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case "quarter":
        newDate.setMonth(newDate.getMonth() - 3);
        break;
      case "year":
        newDate.setFullYear(newDate.getFullYear() - 1);
        break;
    }

    setCurrentDate(newDate);
    updateDateRange(newDate);
  };

  /**
   * Navigate to next period
   */
  const navigateNext = () => {
    const newDate = new Date(currentDate);

    switch (navigationMode) {
      case "month":
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case "quarter":
        newDate.setMonth(newDate.getMonth() + 3);
        break;
      case "year":
        newDate.setFullYear(newDate.getFullYear() + 1);
        break;
    }

    setCurrentDate(newDate);
    updateDateRange(newDate);
  };

  /**
   * Update date range based on navigation mode and current date
   */
  const updateDateRange = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    let fromDate: string;
    let toDate: string;

    switch (navigationMode) {
      case "month":
        fromDate = new Date(year, month, 1).toISOString().split("T")[0];
        toDate = new Date(year, month + 1, 0).toISOString().split("T")[0];
        break;
      case "quarter":
        const quarterStart = Math.floor(month / 3) * 3;
        fromDate = new Date(year, quarterStart, 1).toISOString().split("T")[0];
        toDate = new Date(year, quarterStart + 3, 0)
          .toISOString()
          .split("T")[0];
        break;
      case "year":
        fromDate = new Date(year, 0, 1).toISOString().split("T")[0];
        toDate = new Date(year, 11, 31).toISOString().split("T")[0];
        break;
      default:
        return;
    }

    setDateRange({ from: fromDate, to: toDate });
    setUseCustomRange(true);
  };

  /**
   * Handle navigation mode change
   */
  const handleNavigationModeChange = (mode: string) => {
    const navigationMode = mode as NavigationMode;
    setNavigationMode(navigationMode);

    if (navigationMode === "custom") {
      setUseCustomRange(true);
    } else {
      // Set appropriate interval based on navigation mode
      switch (navigationMode) {
        case "month":
          setInterval("day");
          break;
        case "quarter":
          setInterval("week");
          break;
        case "year":
          setInterval("month");
          break;
      }
      updateDateRange(currentDate);
    }
  };

  /**
   * Auto-adjust interval based on date range
   */
  const getOptimalInterval = (from: string, to: string): FinanceInterval => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const daysDiff = Math.ceil(
      (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff <= 31) return "day";
    if (daysDiff <= 90) return "week";
    if (daysDiff <= 365) return "month";
    if (daysDiff <= 730) return "1/4 year";
    return "year";
  };

  /**
   * Update interval when date range changes
   */
  React.useEffect(() => {
    if (dateRange.from && dateRange.to && !useCustomRange) {
      // Only auto-adjust interval for custom mode
      if (navigationMode === "custom") {
        const optimalInterval = getOptimalInterval(
          dateRange.from,
          dateRange.to
        );
        setInterval(optimalInterval);
      }
    }
  }, [dateRange, useCustomRange, navigationMode]);

  return (
    <Card withBorder p="md" radius="md">
      <Group justify="space-between" align="center">
        <Group>
          <IconFilter size={16} />
          <Text fw={500}>Filter</Text>
        </Group>

        {/* Navigation Controls */}
        <Group>
          <ActionIcon
            variant="light"
            onClick={navigatePrevious}
            disabled={navigationMode === "custom"}
          >
            <IconChevronLeft size={16} />
          </ActionIcon>

          <Text
            fw={600}
            size="sm"
            style={{ minWidth: 120, textAlign: "center" }}
          >
            {getNavigationTitle}
          </Text>

          <ActionIcon
            variant="light"
            onClick={navigateNext}
            disabled={navigationMode === "custom"}
          >
            <IconChevronRight size={16} />
          </ActionIcon>
        </Group>

        <FilterActionIcon onClick={toggle} />
      </Group>

      <Collapse in={filterOpen}>
        <Stack gap="md" mt="md">
          {/* Navigation Mode Selection */}
          <Group>
            <Text size="sm" fw={500}>
              Time Period:
            </Text>
            <SegmentedControl
              value={navigationMode}
              onChange={handleNavigationModeChange}
              data={[
                { value: "month", label: "Month" },
                { value: "quarter", label: "Quarter" },
                { value: "year", label: "Year" },
                { value: "custom", label: "Custom" },
              ]}
              size="xs"
            />
          </Group>

          {/* Primary Controls: Time Period and Chart Type */}
          <Group justify="space-between" align="flex-end">
            <Group>
              <Select
                label="Time Interval"
                value={interval}
                onChange={(value) => setInterval(value as FinanceInterval)}
                data={financeIntervals}
                w={150}
                disabled={navigationMode !== "custom"}
                description={
                  navigationMode === "month"
                    ? "All days of the month"
                    : navigationMode === "quarter"
                      ? "All weeks of the quarter"
                      : navigationMode === "year"
                        ? "All months of the year"
                        : "Automatically based on time period"
                }
              />
              <Select
                label="Chart Type"
                value={chartType}
                onChange={(value) => setChartType(value as ChartType)}
                data={chartTypeOptions}
                w={150}
                leftSection={
                  chartTypeOptions.find((option) => option.value === chartType)
                    ?.icon &&
                  React.createElement(
                    chartTypeOptions.find(
                      (option) => option.value === chartType
                    )!.icon,
                    { size: 16 }
                  )
                }
              />
            </Group>

            <Group>
              <Switch
                label="Show Net"
                checked={showNet}
                onChange={(event) => setShowNet(event.currentTarget.checked)}
              />
            </Group>
          </Group>

          {/* Custom Date Range Controls */}
          {navigationMode === "custom" && (
            <Group>
              <DatePickerInput
                label="From Date"
                placeholder="Select start date"
                value={dateRange.from}
                onChange={(value: string | null) =>
                  setDateRange({ ...dateRange, from: value })
                }
                w={150}
              />
              <DatePickerInput
                label="To Date"
                placeholder="Select end date"
                value={dateRange.to}
                onChange={(value: string | null) =>
                  setDateRange({ ...dateRange, to: value })
                }
                w={150}
              />

              {/* Quick preset buttons for common date ranges */}
              <Group>
                <Button
                  variant="light"
                  size="xs"
                  onClick={() => {
                    const now = new Date();
                    const oneYearAgo = new Date();
                    oneYearAgo.setFullYear(now.getFullYear() - 1);
                    setDateRange({
                      from: oneYearAgo.toISOString().split("T")[0],
                      to: now.toISOString().split("T")[0],
                    });
                  }}
                  leftSection={<IconCalendar size={14} />}
                >
                  Last Year
                </Button>
                <Button
                  variant="light"
                  size="xs"
                  onClick={() => {
                    const now = new Date();
                    const oneMonthAgo = new Date();
                    oneMonthAgo.setMonth(now.getMonth() - 1);
                    setDateRange({
                      from: oneMonthAgo.toISOString().split("T")[0],
                      to: now.toISOString().split("T")[0],
                    });
                  }}
                  leftSection={<IconCalendar size={14} />}
                >
                  Last Month
                </Button>
                <Button
                  variant="light"
                  size="xs"
                  onClick={() => {
                    const now = new Date();
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(now.getDate() - 7);
                    setDateRange({
                      from: oneWeekAgo.toISOString().split("T")[0],
                      to: now.toISOString().split("T")[0],
                    });
                  }}
                  leftSection={<IconCalendar size={14} />}
                >
                  Last Week
                </Button>
              </Group>
            </Group>
          )}
        </Stack>
      </Collapse>
    </Card>
  );
}
