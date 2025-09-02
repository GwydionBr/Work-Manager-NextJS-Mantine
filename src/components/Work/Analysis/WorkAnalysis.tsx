"use client";

import { useState, useEffect } from "react";
import { DateRange, useWorkChartData } from "@/hooks/useWorkChartData";
import { useSettingsStore } from "@/stores/settingsStore";

import { Stack, Paper, Text, Box, Card } from "@mantine/core";
import WorkChartControls, { ChartType } from "./WorkChartControls";
import AnalysisChart from "../../Analysis/AnalysisChart";
import WorkStatisticsCards from "./WorkStatisticsCards";
import { formatDate, formatTime } from "@/utils/formatFunctions";
import {
  getStartOfMonth,
  getEndOfMonth,
} from "@/utils/financeChartHelperFunctions";
import { formatCurrency } from "@/utils/financeChartHelperFunctions";
import { FinanceInterval } from "@/types/settings.types";

import { Tables } from "@/types/db.types";

interface WorkAnalysisProps {
  isOverview?: boolean;
  onClose: () => void;
  sessions: Tables<"timer_session">[];
  project?: Tables<"timer_project">;
}

export default function WorkAnalysis({
  sessions,
  project,
  isOverview,
  onClose,
}: WorkAnalysisProps) {
  const { locale } = useSettingsStore();
  // Chart configuration state
  const [interval, setInterval] = useState<FinanceInterval>("day");
  const [chartType, setChartType] = useState<ChartType>("area");
  const [showSalary, setShowSalary] = useState<boolean>(true);

  // Custom date range functionality
  const [dateRange, setDateRange] = useState<DateRange>({
    from: null,
    to: null,
  });

  // Use custom hook for chart data and statistics
  const { chartData, stats } = useWorkChartData(
    interval,
    dateRange,
    sessions,
    project?.id
  );

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
    formatCurrency(amount, project?.currency ?? "USD", locale);
  const formatDateWithInterval = (dateString: string) =>
    formatDate(new Date(dateString), locale);
  const formatTimeWithSettings = (seconds: number) => formatTime(seconds);

  return (
    <Card withBorder radius="xl" mih="97vh">
      <Stack mb="xl">
        <WorkChartControls
          onClose={onClose}
          interval={interval}
          setInterval={setInterval}
          chartType={chartType}
          setChartType={setChartType}
          showSalary={showSalary}
          setShowSalary={setShowSalary}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
        <Paper w="100%" h="100%" p="xl" withBorder>
          {chartData.length === 0 ? (
            <Stack align="center" justify="center" h={300}>
              <Text c="dimmed">
                {locale === "de-DE"
                  ? "Keine Daten für den ausgewählten Zeitraum"
                  : "No data for the selected time period"}
              </Text>
            </Stack>
          ) : (
            <AnalysisChart
              chartData={chartData}
              formatTime={formatTimeWithSettings}
              showSalary={
                project?.hourly_payment || isOverview ? showSalary : false
              }
              chartType={chartType}
              chartMode="work"
            />
          )}
        </Paper>
        <Box w="100%" h="100%" mt="xl">
          <WorkStatisticsCards
            stats={stats}
            interval={interval}
            formatCurrency={formatCurrencyWithSettings}
            formatDate={formatDateWithInterval}
          />
        </Box>
      </Stack>
    </Card>
  );
}
