import { Box } from "@mantine/core";
import { AreaChart, BarChart, LineChart } from "@mantine/charts";

import classes from "./FinanceOverview.module.css";

type ChartType = "area" | "bar" | "line";

interface FinanceChartProps {
  chartData: Array<{
    date: string;
    expense: number;
    income: number;
    net: number;
  }>;
  formatCurrency: (value: number) => string;
  formatDate: (value: string) => string;
  showNet: boolean;
  chartType: ChartType;
}

export default function FinanceChart({
  chartData,
  formatCurrency,
  formatDate,
  showNet,
  chartType,
}: FinanceChartProps) {
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
  return (
    <Box className={classes.financeOverviewContainer}>{renderChart()}</Box>
  );
}
