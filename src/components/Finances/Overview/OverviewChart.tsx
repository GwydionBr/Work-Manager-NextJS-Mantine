"use client";

import { useEffect, useState, useMemo } from "react";
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
} from "@mantine/core";
import { AreaChart, BarChart, LineChart } from "@mantine/charts";
import { financeIntervals } from "@/constants/settings";
import { FinanceInterval } from "@/types/settings.types";
import {
  IconChartArea,
  IconChartBar,
  IconChartLine,
} from "@tabler/icons-react";

interface ChartData {
  date: string;
  expense: number;
  income: number;
  net: number;
}

interface ChartStats {
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  averageIncome: number;
  averageExpense: number;
  bestMonth: string;
  worstMonth: string;
}

type ChartType = "area" | "bar" | "line";

export default function OverviewChart() {
  const [interval, setInterval] = useState<FinanceInterval>("month");
  const [chartType, setChartType] = useState<ChartType>("area");
  const [showNet, setShowNet] = useState<boolean>(true);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const {
    getChartData,
    fetchFinanceData: fetchData,
    singleCashFlows,
  } = useFinanceStore();

  const { defaultFinanceCurrency } = useSettingsStore();

  const stats = useMemo((): ChartStats => {
    if (chartData.length === 0) {
      return {
        totalIncome: 0,
        totalExpense: 0,
        netAmount: 0,
        averageIncome: 0,
        averageExpense: 0,
        bestMonth: "",
        worstMonth: "",
      };
    }

    const totalIncome = chartData.reduce((sum, item) => sum + item.income, 0);
    const totalExpense = chartData.reduce((sum, item) => sum + item.expense, 0);
    const netAmount = totalIncome - totalExpense;
    const averageIncome = totalIncome / chartData.length;
    const averageExpense = totalExpense / chartData.length;

    const bestMonth = chartData.reduce((best, current) =>
      current.net > best.net ? current : best
    ).date;

    const worstMonth = chartData.reduce((worst, current) =>
      current.net < worst.net ? current : worst
    ).date;

    return {
      totalIncome,
      totalExpense,
      netAmount,
      averageIncome,
      averageExpense,
      bestMonth,
      worstMonth,
    };
  }, [chartData]);

  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true);
      try {
        if (singleCashFlows.length === 0) {
          await fetchData();
        }
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
  }, [interval, singleCashFlows]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: defaultFinanceCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    switch (interval) {
      case "day":
        return date.toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit",
        });
      case "week":
        // Calculate week number manually
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor(
          (date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
        );
        const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        return `KW ${weekNumber}`;
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

  const renderChart = () => {
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
      tickFormatter: (value: string) => formatDate(value),
    };

    switch (chartType) {
      case "area":
        return (
          <AreaChart
            {...commonProps}
            series={[
              { name: "income", color: "teal.6", label: "Income" },
              { name: "expense", color: "red.6", label: "Expenses" },
              ...(showNet
                ? [{ name: "net", color: "blue.6", label: "Net" }]
                : []),
            ]}
            curveType="linear"
            fillOpacity={0.3}
          />
        );
      case "bar":
        return (
          <BarChart
            {...commonProps}
            series={[
              { name: "income", color: "teal.6", label: "Income" },
              { name: "expense", color: "red.6", label: "Expenses" },
              ...(showNet
                ? [{ name: "net", color: "blue.6", label: "Net" }]
                : []),
            ]}
          />
        );
      case "line":
        return (
          <LineChart
            {...commonProps}
            series={[
              { name: "income", color: "teal.6", label: "Income" },
              { name: "expense", color: "red.6", label: "Expenses" },
              ...(showNet
                ? [{ name: "net", color: "blue.6", label: "Net" }]
                : []),
            ]}
            curveType="linear"
          />
        );
      default:
        return null;
    }
  };

  const chartTypeOptions = [
    { value: "area", label: "Area", icon: IconChartArea },
    { value: "bar", label: "Bar", icon: IconChartBar },
    { value: "line", label: "Line", icon: IconChartLine },
  ];

  return (
    <Stack w="100%" gap="md">
      {/* Controls */}
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

      {/* Statistics Cards */}
      <Grid gutter="md">
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
      </Grid>

      {/* Chart */}
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
