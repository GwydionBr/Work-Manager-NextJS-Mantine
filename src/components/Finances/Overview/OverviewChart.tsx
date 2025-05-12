"use client";

import { AreaChart } from "@mantine/charts";
import { Paper, Select, Stack } from "@mantine/core";
import { useFinanceStore } from "@/stores/financeStore";
import { FinanceInterval } from "@/types/settings.types";
import { financeIntervals } from "@/constants/settings";
import { useEffect, useState } from "react";
import { Tables } from "@/types/db.types";

interface ChartData {
  date: string;
  expense: number;
  income: number;
}

export default function OverviewChart() {
  const [interval, setInterval] = useState<FinanceInterval>("month");
  const [columns, setColumns] = useState<number>(6);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const { getChartData, fetchData } = useFinanceStore();

  useEffect(() => {
    const fetchChartData = async () => {
      await fetchData();
      const newChartData = await getChartData(interval);
      console.log("New Chart Data", newChartData);
      setChartData(newChartData);
    };
    fetchChartData();
  }, [interval, columns]);

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