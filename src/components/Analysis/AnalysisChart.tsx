import { Box } from "@mantine/core";
import { AreaChart, BarChart, LineChart } from "@mantine/charts";

type ChartType = "area" | "bar" | "line";
type ChartMode = "work" | "finance";

// Define different data structures for each chart mode
type FinanceChartData = {
  date: string;
  expense: number;
  income: number;
  net: number;
};

type WorkChartData = {
  date: string;
  time: number;
  salary: number;
};

// Conditional type for chartData based on chartMode
type ChartData<T extends ChartMode> = T extends "finance"
  ? FinanceChartData[]
  : WorkChartData[];

interface AnalysisChartProps<T extends ChartMode = ChartMode> {
  chartData: ChartData<T>;
  formatCurrency: (value: number) => string;
  formatDate: (value: string) => string;
  formatTime?: (value: number) => string;
  showNet?: boolean;
  showSalary?: boolean;
  chartType: ChartType;
  chartMode: T;
}

export default function AnalysisChart<T extends ChartMode>({
  chartData,
  formatCurrency,
  formatDate,
  formatTime,
  showNet,
  showSalary,
  chartType,
  chartMode,
}: AnalysisChartProps<T>) {
  /**
   * Render the appropriate chart component based on selected type
   * Configures common props and series for all chart types
   */
  const renderChart = () => {
    // Common configuration for all chart types
    const commonProps = {
      data: chartData,
      dataKey: "date",
      h: 350,
      px: 10,
      mt: 20,
      tickLine: "y" as const,
      gridAxis: "x" as const,
      withLegend: true,
      legendProps: { verticalAlign: "bottom" as const, height: 50 },
      valueFormatter: (value: number) => {
        // For work charts, we need to format time values differently
        // Since we can't access the dataKey context, we'll use a simpler approach
        if (chartMode === "work" && formatTime) {
          // Check if this looks like a time value (large numbers for seconds)
          if (value > 1000) {
            return formatTime(value);
          }
        }
        return formatCurrency(value);
      },
      xAxisProps: {
        tickFormatter: (value: string) => formatDate(value),
      },
    };

    // Define series configuration for income, expenses, and net
    const series =
      chartMode === "finance"
        ? [
            { name: "income", color: "teal.6", label: "Income" },
            { name: "expense", color: "red.6", label: "Expenses" },
            ...(showNet
              ? [{ name: "net", color: "blue.6", label: "Net" }]
              : []),
          ]
        : [
            { name: "time", color: "blue.6", label: "Time" },
            ...(showSalary
              ? [{ name: "salary", color: "green.6", label: "Salary" }]
              : []),
          ];

    // Render appropriate chart type
    switch (chartType) {
      case "area":
        return (
          <AreaChart
            {...commonProps}
            series={series}
            curveType="monotone"
            fillOpacity={0.3}
          />
        );
      case "bar":
        return <BarChart {...commonProps} series={series} />;
      case "line":
        return (
          <LineChart {...commonProps} series={series} curveType="monotone" />
        );
      default:
        return null;
    }
  };
  return <Box>{renderChart()}</Box>;
}
