"use client";

import { Grid } from "@mantine/core";
import StatisticCard from "./StatisticCard";
import { ChartStats } from "@/hooks/useFinanceChartData";
import { FinanceInterval } from "@/types/settings.types";
import { useSettingsStore } from "@/stores/settingsStore";
import { formatDate, formatMoney } from "@/utils/formatFunctions";

/**
 * Props for the StatisticsCards component
 */
interface StatisticsCardsProps {
  stats: ChartStats;
  interval: FinanceInterval;
}

/**
 * Statistics Cards Section Component
 *
 * Displays all financial statistics in a grid layout using
 * reusable StatisticCard components
 */
export default function StatisticsCards({
  stats,
  interval,
}: StatisticsCardsProps) {
  const { locale, defaultFinanceCurrency } = useSettingsStore();

  function getIntervalString() {
    switch (interval) {
      case "day":
        return locale === "de-DE" ? "Tag" : "day";
      case "week":
        return locale === "de-DE" ? "Woche" : "week";
      case "month":
        return locale === "de-DE" ? "Monat" : "month";
      case "1/4 year":
        return locale === "de-DE" ? "Quartal" : "quarter";
      case "1/2 year":
        return locale === "de-DE" ? "Halbjahr" : "half year";
      case "year":
        return locale === "de-DE" ? "Jahr" : "year";
    }
  }

  return (
    <Grid gutter="md">
      {/* Total Income Card */}
      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <StatisticCard
          type="totalIncome"
          value={formatMoney(stats.totalIncome, defaultFinanceCurrency, locale)}
          subtitle={`Ø ${formatMoney(stats.averageIncome, defaultFinanceCurrency, locale)} ${locale === "de-DE" ? "pro" : "per"} ${getIntervalString()}`}
          color="teal"
        />
      </Grid.Col>

      {/* Total Expenses Card */}
      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <StatisticCard
          type="totalExpense"
          value={formatMoney(
            stats.totalExpense,
            defaultFinanceCurrency,
            locale
          )}
          subtitle={`Ø ${formatMoney(stats.averageExpense, defaultFinanceCurrency, locale)} ${locale === "de-DE" ? "pro" : "per"} ${getIntervalString()}`}
          color="red"
        />
      </Grid.Col>

      {/* Net Amount Card */}
      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <StatisticCard
          type="net"
          value={formatMoney(stats.netAmount, defaultFinanceCurrency, locale)}
          color={stats.netAmount >= 0 ? "green" : "red"}
          badge={
            stats.netAmount >= 0
              ? locale === "de-DE"
                ? "Gewinn"
                : "Profit"
              : locale === "de-DE"
                ? "Verlust"
                : "Loss"
          }
          badgeColor={stats.netAmount >= 0 ? "green" : "red"}
        />
      </Grid.Col>

      {/* Profit Margin Card */}
      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <StatisticCard
          type="profitMargin"
          value={`${stats.profitMargin.toFixed(1)}%`}
          subtitle={`${stats.totalPeriods} ${locale === "de-DE" ? "Perioden" : "Periods"}`}
          color={stats.profitMargin >= 0 ? "green" : "red"}
        />
      </Grid.Col>

      {/* Best Period Card */}
      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <StatisticCard
          type="bestPeriod"
          value={
            stats.bestMonth
              ? formatDate(new Date(stats.bestMonth), locale)
              : "-"
          }
          subtitle={
            locale === "de-DE" ? "Höchster Nettobetrag" : "Highest Net Value"
          }
          color="green"
        />
      </Grid.Col>

      {/* Worst Period Card */}
      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <StatisticCard
          type="worstPeriod"
          value={
            stats.worstMonth
              ? formatDate(new Date(stats.worstMonth), locale)
              : "-"
          }
          subtitle={
            locale === "de-DE" ? "Niedrigster Nettobetrag" : "Lowest Net Value"
          }
          color="red"
        />
      </Grid.Col>
    </Grid>
  );
}
