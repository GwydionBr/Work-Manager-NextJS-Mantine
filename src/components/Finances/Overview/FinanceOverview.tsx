"use client";

import { useState, useEffect } from "react";
import {
  useFinanceChartData,
  type DateRange,
} from "@/hooks/useFinanceChartData";
import { useSettingsStore } from "@/stores/settingsStore";

import { Stack, Paper, Text, Box } from "@mantine/core";
import AnalysisChart from "../../Analysis/AnalysisChart";
import StatisticsCards from "./StatisticsCards";
import ChartControls, { type ChartType } from "./ChartControls";

import {
  formatCurrency,
  formatDate,
  getStartOfMonth,
  getEndOfMonth,
} from "@/utils/financeChartHelperFunctions";

import classes from "./FinanceOverview.module.css";

import { type FinanceInterval } from "@/types/settings.types";

/**
 * Financial Overview Chart Component
 *
 * Displays financial data in various chart formats with:
 * - Smart time period selection with navigation
 * - Auto-adjusting intervals based on date range
 * - Multiple chart types (area, bar, line)
 * - Comprehensive statistics cards
 * - Complete time period coverage (including empty periods)
 * - Timezone-safe date handling with date-fns
 */
export default function FinanceOverview() {
  // Chart configuration state
  const [interval, setInterval] = useState<FinanceInterval>("day");
  const [chartType, setChartType] = useState<ChartType>("area");
  const [showNet, setShowNet] = useState<boolean>(true);

  // Custom date range functionality
  const [dateRange, setDateRange] = useState<DateRange>({
    from: null,
    to: null,
  });

  // Get currency from settings
  const { defaultFinanceCurrency } = useSettingsStore();

  // Use custom hook for chart data and statistics
  const { chartData, stats } = useFinanceChartData(interval, dateRange);

  // Initialize with current month using timezone-safe date functions
  useEffect(() => {
    const now = new Date();
    setDateRange({
      from: getStartOfMonth(now),
      to: getEndOfMonth(now),
    });
  }, []);

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
      />
      <Paper w="100%" h="100%" p="xl" withBorder>
        {chartData.length === 0 ? (
          <Stack align="center" justify="center" h={300}>
            <Text c="dimmed">Keine Daten für den ausgewählten Zeitraum</Text>
          </Stack>
        ) : (
          <AnalysisChart
            chartData={chartData}
            formatCurrency={formatCurrencyWithSettings}
            formatDate={formatDateWithInterval}
            showNet={showNet}
            chartType={chartType}
            chartMode="finance"
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
