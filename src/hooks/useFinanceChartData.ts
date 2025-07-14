import { useEffect, useState, useMemo, useCallback } from "react";
import { useFinanceStore } from "@/stores/financeStore";
import { FinanceInterval } from "@/types/settings.types";

/**
 * Represents a single data point in the chart
 * Contains financial data for a specific time period
 */
export interface FinanceChartData {
  date: string; // Date string in ISO format (YYYY-MM-DD)
  expense: number; // Total expenses for this period
  income: number; // Total income for this period
  net: number; // Net amount (income - expense)
}

/**
 * Calculated statistics for the selected time period
 * Used to display summary cards above the chart
 */
export interface ChartStats {
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
 * Date range for custom time period selection
 * Uses string format for DatePickerInput compatibility
 */
export interface DateRange {
  from: string | null; // Start date in YYYY-MM-DD format
  to: string | null; // End date in YYYY-MM-DD format
}

/**
 * Custom hook for managing finance chart data and statistics
 *
 * Features:
 * - Flexible time period selection (day, week, month, quarter, half-year, year)
 * - Custom date range selection
 * - Complete time period coverage (including empty periods)
 * - Comprehensive statistics calculation
 * - Performance optimized with memoization
 */
export function useFinanceChartData(
  interval: FinanceInterval,
  useCustomRange: boolean,
  dateRange: DateRange
) {
  // Data and loading state
  const [chartData, setChartData] = useState<FinanceChartData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Get data from stores
  const { singleCashFlows } = useFinanceStore();

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
  }, [chartDataKey, getChartData, interval]);

  return {
    chartData,
    stats,
    isLoading,
  };
}
