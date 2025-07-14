"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  Paper,
  Select,
  Stack,
  Group,
  Text,
  Badge,
  Card,
  Grid,
  Switch,
  Button,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { AreaChart, BarChart, LineChart } from "@mantine/charts";
import { FinanceInterval } from "@/types/settings.types";
import {
  IconChartArea,
  IconChartBar,
  IconChartLine,
  IconCalendar,
} from "@tabler/icons-react";
import { financeIntervals } from "@/constants/settings";

/**
 * Represents a single data point in the chart
 * Contains financial data for a specific time period
 */
interface ChartData {
  date: string; // Date string in ISO format (YYYY-MM-DD)
  expense: number; // Total expenses for this period
  income: number; // Total income for this period
  net: number; // Net amount (income - expense)
}

/**
 * Calculated statistics for the selected time period
 * Used to display summary cards above the chart
 */
interface ChartStats {
  totalIncome: number; // Sum of all income
  totalExpense: number; // Sum of all expenses
  netAmount: number; // Total net (income - expenses)
  averageIncome: number; // Average income per period
  averageExpense: number; // Average expense per period
  bestMonth: string; // Period with highest net value
  worstMonth: string; // Period with lowest net value
  totalPeriods: number; // Number of periods in the data
  profitMargin: number; // Profit margin as percentage
}

/**
 * Available chart visualization types
 */
type ChartType = "area" | "bar" | "line";

/**
 * Date range for custom time period selection
 * Uses string format for DatePickerInput compatibility
 */
interface DateRange {
  from: string | null; // Start date in YYYY-MM-DD format
  to: string | null; // End date in YYYY-MM-DD format
}

/**
 * Financial Overview Chart Component
 *
 * Displays financial data in various chart formats with:
 * - Flexible time period selection (day, week, month, quarter, half-year, year)
 * - Custom date range selection
 * - Multiple chart types (area, bar, line)
 * - Comprehensive statistics cards
 * - Complete time period coverage (including empty periods)
 */
export default function OverviewChart() {
  // Chart configuration state
  const [interval, setInterval] = useState<FinanceInterval>("month");
  const [chartType, setChartType] = useState<ChartType>("area");
  const [showNet, setShowNet] = useState<boolean>(true);

  // Data and loading state
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Custom date range functionality
  const [dateRange, setDateRange] = useState<DateRange>({
    from: null,
    to: null,
  });
  const [useCustomRange, setUseCustomRange] = useState<boolean>(false);

  // Get data from stores
  const { singleCashFlows } = useFinanceStore();
  const { defaultFinanceCurrency } = useSettingsStore();

  /**
   * Calculate comprehensive statistics from chart data
   * Uses a single iteration for better performance
   */
  const stats = useMemo((): ChartStats => {
    // Return default values if no data available
    if (chartData.length === 0) {
      return {
        totalIncome: 0,
        totalExpense: 0,
        netAmount: 0,
        averageIncome: 0,
        averageExpense: 0,
        bestMonth: "",
        worstMonth: "",
        totalPeriods: 0,
        profitMargin: 0,
      };
    }

    try {
      // Single iteration to calculate all stats at once for better performance
      const totals = chartData.reduce(
        (acc, item) => ({
          income: acc.income + item.income,
          expense: acc.expense + item.expense,
          best: item.net > acc.best.net ? item : acc.best,
          worst: item.net < acc.worst.net ? item : acc.worst,
        }),
        {
          income: 0,
          expense: 0,
          best: chartData[0],
          worst: chartData[0],
        }
      );

      // Calculate derived statistics
      const netAmount = totals.income - totals.expense;
      const averageIncome = totals.income / chartData.length;
      const averageExpense = totals.expense / chartData.length;
      const profitMargin =
        totals.income > 0 ? (netAmount / totals.income) * 100 : 0;

      return {
        totalIncome: totals.income,
        totalExpense: totals.expense,
        netAmount,
        averageIncome,
        averageExpense,
        bestMonth: totals.best.date,
        worstMonth: totals.worst.date,
        totalPeriods: chartData.length,
        profitMargin,
      };
    } catch (error) {
      console.error("Error calculating financial stats:", error);
      return {
        totalIncome: 0,
        totalExpense: 0,
        netAmount: 0,
        averageIncome: 0,
        averageExpense: 0,
        bestMonth: "",
        worstMonth: "",
        totalPeriods: 0,
        profitMargin: 0,
      };
    }
  }, [chartData]);

  /**
   * Create a stable key for useEffect dependencies
   * Prevents unnecessary re-renders by memoizing the dependency array
   */
  const chartDataKey = useMemo(() => {
    return `${interval}-${useCustomRange}-${dateRange.from}-${dateRange.to}-${singleCashFlows.length}`;
  }, [
    interval,
    useCustomRange,
    dateRange.from,
    dateRange.to,
    singleCashFlows.length,
  ]);

  /**
   * Fetch and process chart data when dependencies change
   * Handles loading states and error handling
   */
  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true);
      try {
        const rawChartData = await getChartData(interval);

        // Add net calculation to chart data
        const enhancedChartData = rawChartData.map((item) => ({
          ...item,
          net: item.income - item.expense,
        }));

        setChartData(enhancedChartData);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChartData();
  }, [chartDataKey]);

  /**
   * Generate chart data from cash flows
   *
   * Features:
   * - Supports custom date ranges
   * - Generates complete time periods (including empty ones)
   * - Groups data by selected interval (day, week, month, etc.)
   * - Handles different time period formats
   */
  const getChartData = useCallback(
    async (interval: FinanceInterval) => {
      // Determine date range based on user selection
      let startDate: Date;
      let endDate: Date;

      if (useCustomRange && dateRange.from && dateRange.to) {
        // Use custom date range if specified
        startDate = new Date(dateRange.from);
        endDate = new Date(dateRange.to);
      } else {
        // Default to last 12 months if no custom range
        endDate = new Date();
        startDate = new Date();
        startDate.setFullYear(endDate.getFullYear() - 1);
      }

      const groupedData: {
        [key: string]: { expense: number; income: number };
      } = {};

      /**
       * Generate all time periods in the selected range
       * Ensures complete coverage even for periods without data
       */
      const generateTimePeriods = () => {
        const periods: string[] = [];
        const current = new Date(startDate);

        while (current <= endDate) {
          let key: string;

          // Create period keys based on selected interval
          switch (interval) {
            case "day":
              key = current.toISOString().split("T")[0]; // YYYY-MM-DD
              current.setDate(current.getDate() + 1);
              break;
            case "week":
              // Calculate week start (Monday)
              const weekStart = new Date(current);
              weekStart.setDate(current.getDate() - current.getDay());
              key = weekStart.toISOString().split("T")[0];
              current.setDate(current.getDate() + 7);
              break;
            case "month":
              key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM
              current.setMonth(current.getMonth() + 1);
              break;
            case "1/4 year":
              const quarter = Math.floor(current.getMonth() / 3) + 1;
              key = `${current.getFullYear()}-Q${quarter}`; // YYYY-Q1
              current.setMonth(current.getMonth() + 3);
              break;
            case "1/2 year":
              const half = Math.floor(current.getMonth() / 6) + 1;
              key = `${current.getFullYear()}-H${half}`; // YYYY-H1
              current.setMonth(current.getMonth() + 6);
              break;
            case "year":
              key = current.getFullYear().toString(); // YYYY
              current.setFullYear(current.getFullYear() + 1);
              break;
            default:
              key = current.toISOString().split("T")[0];
              current.setDate(current.getDate() + 1);
          }

          // Avoid duplicate periods
          if (!periods.includes(key)) {
            periods.push(key);
          }
        }

        return periods;
      };

      // Initialize all periods with zero values to ensure complete coverage
      const allPeriods = generateTimePeriods();
      allPeriods.forEach((period) => {
        groupedData[period] = { expense: 0, income: 0 };
      });

      // Add actual cash flow data to the grouped periods
      singleCashFlows.forEach((flow) => {
        const date = new Date(flow.date);

        // Skip flows outside custom date range if specified
        if (useCustomRange && dateRange.from && dateRange.to) {
          const fromDate = new Date(dateRange.from);
          const toDate = new Date(dateRange.to);
          if (date < fromDate || date > toDate) {
            return;
          }
        }

        // Determine the period key for this cash flow
        let key: string;

        switch (interval) {
          case "day":
            key = date.toISOString().split("T")[0];
            break;
          case "week":
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            key = weekStart.toISOString().split("T")[0];
            break;
          case "month":
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            break;
          case "1/4 year":
            const quarter = Math.floor(date.getMonth() / 3) + 1;
            key = `${date.getFullYear()}-Q${quarter}`;
            break;
          case "1/2 year":
            const half = Math.floor(date.getMonth() / 6) + 1;
            key = `${date.getFullYear()}-H${half}`;
            break;
          case "year":
            key = date.getFullYear().toString();
            break;
          default:
            key = date.toISOString().split("T")[0];
        }

        // Add cash flow to the appropriate period
        if (groupedData[key]) {
          if (flow.type === "expense") {
            groupedData[key].expense += flow.amount;
          } else {
            groupedData[key].income += flow.amount;
          }
        }
      });

      // Convert grouped data to array format and sort by date
      const chartData = Object.entries(groupedData)
        .map(([date, values]) => ({
          date,
          expense: values.expense,
          income: values.income,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return chartData;
    },
    [interval, useCustomRange, dateRange.from, dateRange.to, singleCashFlows]
  );

  /**
   * Format currency amounts according to user's locale and currency preference
   */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: defaultFinanceCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  /**
   * Format dates for display based on selected interval
   * Provides user-friendly date representations
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    switch (interval) {
      case "day":
        return date.toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit",
        });
      case "week":
        // Calculate week number manually for German format
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor(
          (date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
        );
        const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        return `KW ${weekNumber}`; // German: Kalenderwoche
      case "month":
        return date.toLocaleDateString("de-DE", {
          month: "short",
          year: "2-digit",
        });
      case "1/4 year":
        return `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
      case "1/2 year":
        return `H${Math.floor(date.getMonth() / 6) + 1} ${date.getFullYear()}`;
      case "year":
        return date.getFullYear().toString();
      default:
        return dateString;
    }
  };

  /**
   * Render the appropriate chart component based on selected type
   * Configures common props and series for all chart types
   */
  const renderChart = () => {
    // Common configuration for all chart types
    const commonProps = {
      data: chartData,
      dataKey: "date",
      h: 300,
      px: 20,
      mt: 20,
      tickLine: "y" as const,
      gridAxis: "x" as const,
      withLegend: true,
      legendProps: { verticalAlign: "bottom" as const, height: 50 },
      valueFormatter: (value: number) => formatCurrency(value),
      xAxisProps: {
        tickFormatter: (value: string) => formatDate(value),
      },
    };

    // Define series configuration for income, expenses, and net
    const series = [
      { name: "income", color: "teal.6", label: "Income" },
      { name: "expense", color: "red.6", label: "Expenses" },
      ...(showNet ? [{ name: "net", color: "blue.6", label: "Net" }] : []),
    ];

    // Render appropriate chart type
    switch (chartType) {
      case "area":
        return (
          <AreaChart
            {...commonProps}
            series={series}
            curveType="linear"
            fillOpacity={0.3}
          />
        );
      case "bar":
        return <BarChart {...commonProps} series={series} />;
      case "line":
        return (
          <LineChart {...commonProps} series={series} curveType="linear" />
        );
      default:
        return null;
    }
  };

  // Chart type options for the dropdown
  const chartTypeOptions = [
    { value: "area", label: "Area", icon: IconChartArea },
    { value: "bar", label: "Bar", icon: IconChartBar },
    { value: "line", label: "Line", icon: IconChartLine },
  ];

  return (
    <Stack w="100%" gap="md">
      {/* Chart Controls Section */}
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
              data={chartTypeOptions.map((option) => ({
                value: option.value,
                label: option.label,
                icon: option.icon,
              }))}
              w={150}
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
            onChange={(event) => setUseCustomRange(event.currentTarget.checked)}
          />

          {useCustomRange && (
            <Group>
              <DatePickerInput
                label="From Date"
                placeholder="Pick start date"
                value={dateRange.from}
                onChange={(value: string | null) =>
                  setDateRange((prev) => ({ ...prev, from: value }))
                }
                w={150}
              />
              <DatePickerInput
                label="To Date"
                placeholder="Pick end date"
                value={dateRange.to}
                onChange={(value: string | null) =>
                  setDateRange((prev) => ({ ...prev, to: value }))
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

      {/* Statistics Cards Section */}
      <Grid gutter="md">
        {/* Total Income Card */}
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
              Total Income
            </Text>
            <Text size="xl" fw={700} c="teal">
              {formatCurrency(stats.totalIncome)}
            </Text>
            <Text size="xs" c="dimmed">
              Ø {formatCurrency(stats.averageIncome)} per {interval}
            </Text>
          </Card>
        </Grid.Col>

        {/* Total Expenses Card */}
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
              Total Expenses
            </Text>
            <Text size="xl" fw={700} c="red">
              {formatCurrency(stats.totalExpense)}
            </Text>
            <Text size="xs" c="dimmed">
              Ø {formatCurrency(stats.averageExpense)} per {interval}
            </Text>
          </Card>
        </Grid.Col>

        {/* Net Amount Card */}
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
              Net
            </Text>
            <Text size="xl" fw={700} c={stats.netAmount >= 0 ? "green" : "red"}>
              {formatCurrency(stats.netAmount)}
            </Text>
            <Badge
              color={stats.netAmount >= 0 ? "green" : "red"}
              variant="light"
            >
              {stats.netAmount >= 0 ? "Profit" : "Loss"}
            </Badge>
          </Card>
        </Grid.Col>

        {/* Profit Margin Card */}
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
              Profit Margin
            </Text>
            <Text
              size="xl"
              fw={700}
              c={stats.profitMargin >= 0 ? "green" : "red"}
            >
              {stats.profitMargin.toFixed(1)}%
            </Text>
            <Text size="xs" c="dimmed">
              {stats.totalPeriods} periods
            </Text>
          </Card>
        </Grid.Col>

        {/* Best Period Card */}
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
              Best Period
            </Text>
            <Text size="lg" fw={600}>
              {stats.bestMonth ? formatDate(stats.bestMonth) : "-"}
            </Text>
            <Text size="xs" c="dimmed">
              Highest Net Value
            </Text>
          </Card>
        </Grid.Col>

        {/* Worst Period Card */}
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
              Worst Period
            </Text>
            <Text size="lg" fw={600}>
              {stats.worstMonth ? formatDate(stats.worstMonth) : "-"}
            </Text>
            <Text size="xs" c="dimmed">
              Lowest Net Value
            </Text>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Chart Display Section */}
      <Paper w="100%" h="100%" p="xl" withBorder>
        {isLoading ? (
          <Stack align="center" justify="center" h={300}>
            <Text c="dimmed">Loading chart data...</Text>
          </Stack>
        ) : chartData.length === 0 ? (
          <Stack align="center" justify="center" h={300}>
            <Text c="dimmed">No data for the selected time period</Text>
          </Stack>
        ) : (
          renderChart()
        )}
      </Paper>
    </Stack>
  );
}
