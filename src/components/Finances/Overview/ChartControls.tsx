"use client";

import { useDisclosure } from "@mantine/hooks";

import {
  Group,
  Select,
  Switch,
  Button,
  Stack,
  Card,
  Collapse,
  Text,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import {
  IconChartArea,
  IconChartBar,
  IconChartLine,
  IconCalendar,
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
 * - Time period selection (day, week, month, quarter, half-year, year)
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
  // Chart type options for the dropdown
  const chartTypeOptions = [
    { value: "area", label: "Area", icon: IconChartArea },
    { value: "bar", label: "Bar", icon: IconChartBar },
    { value: "line", label: "Line", icon: IconChartLine },
  ];

  return (
    <Card withBorder p="md" radius="md">
      <Group justify="space-between" align="flex-end">
        <Text>Filters</Text>
        <Text>
          {dateRange.from} - {dateRange.to}
        </Text>
        <FilterActionIcon onClick={toggle} />
      </Group>
      <Collapse in={filterOpen}>
        <Stack gap="md">
          {/* Primary Controls: Time Period and Chart Type */}
          <Group justify="space-between" align="flex-end">
            <Group>
              <Select
                label="Time Period"
                value={interval}
                onChange={(value) => setInterval(value as FinanceInterval)}
                data={financeIntervals}
                w={150}
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
          <Group>
            <Switch
              label="Custom Date Range"
              checked={useCustomRange}
              onChange={(event) =>
                setUseCustomRange(event.currentTarget.checked)
              }
            />

            {useCustomRange && (
              <Group>
                <DatePickerInput
                  label="From Date"
                  placeholder="Pick start date"
                  value={dateRange.from}
                  onChange={(value: string | null) =>
                    setDateRange({ ...dateRange, from: value })
                  }
                  w={150}
                />
                <DatePickerInput
                  label="To Date"
                  placeholder="Pick end date"
                  value={dateRange.to}
                  onChange={(value: string | null) =>
                    setDateRange({ ...dateRange, to: value })
                  }
                  w={150}
                />
                {/* Quick preset buttons for common date ranges */}
                <Button
                  variant="light"
                  onClick={() => {
                    const now = new Date();
                    const oneYearAgo = new Date();
                    oneYearAgo.setFullYear(now.getFullYear() - 1);
                    setDateRange({
                      from: oneYearAgo.toISOString().split("T")[0],
                      to: now.toISOString().split("T")[0],
                    });
                  }}
                  leftSection={<IconCalendar size={16} />}
                >
                  Last Year
                </Button>
                <Button
                  variant="light"
                  onClick={() => {
                    const now = new Date();
                    const oneMonthAgo = new Date();
                    oneMonthAgo.setMonth(now.getMonth() - 1);
                    setDateRange({
                      from: oneMonthAgo.toISOString().split("T")[0],
                      to: now.toISOString().split("T")[0],
                    });
                  }}
                  leftSection={<IconCalendar size={16} />}
                >
                  Last Month
                </Button>
              </Group>
            )}
          </Group>
        </Stack>
      </Collapse>
    </Card>
  );
}
