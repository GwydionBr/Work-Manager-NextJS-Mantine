"use client";

import { useState } from "react";
import { Stack, Paper, Text, Box } from "@mantine/core";
import { useSettingsStore } from "@/stores/settingsStore";
import classes from "./FinanceOverview.module.css";
import FinanceChart from "./FinanceChart";
import StatisticsCards from "./StatisticsCards";
import ChartControls, { type ChartType } from "./ChartControls";
import {
  useFinanceChartData,
  type DateRange,
} from "@/hooks/useFinanceChartData";
import {
  formatCurrency,
  formatDate,
} from "@/utils/financeChartHelperFunctions";
import { type FinanceInterval } from "@/types/settings.types";

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
export default function FinanceOverview() {
  // Chart configuration state
  const [interval, setInterval] = useState<FinanceInterval>("month");
  const [chartType, setChartType] = useState<ChartType>("area");
  const [showNet, setShowNet] = useState<boolean>(true);

  // Custom date range functionality
  const [dateRange, setDateRange] = useState<DateRange>({
    from: null,
    to: null,
  });
  const [useCustomRange, setUseCustomRange] = useState<boolean>(false);

  // Get currency from settings
  const { defaultFinanceCurrency } = useSettingsStore();

  // Use custom hook for chart data and statistics
  const { chartData, stats } = useFinanceChartData(
    interval,
    useCustomRange,
    dateRange
  );

  // Create formatter functions with current settings
  const formatCurrencyWithSettings = (amount: number) =>
    formatCurrency(amount, defaultFinanceCurrency);
  const formatDateWithInterval = (dateString: string) =>
    formatDate(dateString, interval);

  return (
    <Stack className={classes.financeOverviewContainer} mb="xl">
      <ChartControls
        interval={interval}
        setInterval={setInterval}
        chartType={chartType}
        setChartType={setChartType}
        showNet={showNet}
        setShowNet={setShowNet}
        dateRange={dateRange}
        setDateRange={setDateRange}
        useCustomRange={useCustomRange}
        setUseCustomRange={setUseCustomRange}
      />
      <Paper w="100%" h="100%" p="xl" withBorder>
        {chartData.length === 0 ? (
          <Stack align="center" justify="center" h={300}>
            <Text c="dimmed">No data for the selected time period</Text>
          </Stack>
        ) : (
          <FinanceChart
            chartData={chartData}
            formatCurrency={formatCurrencyWithSettings}
            formatDate={formatDateWithInterval}
            showNet={showNet}
            chartType={chartType}
          />
        )}
      </Paper>
      <Box w="100%" h="100%" mt="xl">
        <StatisticsCards
          stats={stats}
          interval={interval}
          formatCurrency={formatCurrencyWithSettings}
          formatDate={formatDateWithInterval}
        />
      </Box>
    </Stack>
  );
}
