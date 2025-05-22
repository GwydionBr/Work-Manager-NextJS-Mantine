"use client";

import { useEffect, useState } from "react";
import { useFinanceStore } from "@/stores/financeStore";

import { Paper, Select, Stack } from "@mantine/core";
import { AreaChart } from "@mantine/charts";
import { financeIntervals } from "@/constants/settings";

import { FinanceInterval } from "@/types/settings.types";

interface ChartData {
  date: string;
  expense: number;
  income: number;
}

export default function OverviewChart() {
  const [interval, setInterval] = useState<FinanceInterval>("week");
  const [columns, setColumns] = useState<number>(6);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const {
    getChartData,
    fetchFinanceData: fetchData,
    singleCashFlows,
  } = useFinanceStore();

  useEffect(() => {
    const fetchChartData = async () => {
      if (singleCashFlows.length === 0) {
        await fetchData();
      }
      const newChartData = await getChartData(interval);
      setChartData(newChartData);
    };
    fetchChartData();
  }, [interval, columns, singleCashFlows]);

  return (
    <Stack w="100%">
      <Paper w="100%" h="100%" p="xl">
        <AreaChart
          px={20}
          mt={40}
          h={300}
          data={chartData}
          dataKey="date"
          series={[
            { name: "income", color: "teal.6" },
            { name: "expense", color: "red.6" },
          ]}
          curveType="linear"
        />
      </Paper>
      <Select
        label="Select Interval"
        value={interval}
        onChange={(value) => setInterval(value as FinanceInterval)}
        data={financeIntervals}
      />
    </Stack>
  );
}
