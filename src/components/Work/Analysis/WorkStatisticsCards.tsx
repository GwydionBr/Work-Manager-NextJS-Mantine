"use client";

import { useSettingsStore } from "@/stores/settingsStore";

import { Grid } from "@mantine/core";
import WorkStatisticCard from "./WorkStatisticCard";
import { WorkChartStats } from "@/hooks/useWorkChartData";
import { FinanceInterval } from "@/types/settings.types";
import { formatTime } from "@/utils/workHelperFunctions";

/**
 * Props for the WorkStatisticsCards component
 */
interface WorkStatisticsCardsProps {
  stats: WorkChartStats;
  interval: FinanceInterval;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
}

/**
 * Work Statistics Cards Section Component
 *
 * Displays all work statistics in a grid layout using
 * reusable WorkStatisticCard components
 */
export default function WorkStatisticsCards({
  stats,
  interval,
  formatCurrency,
  formatDate,
}: WorkStatisticsCardsProps) {
  const { locale } = useSettingsStore();

  const getIntervalString = () => {
    switch (interval) {
      case "day":
        return locale === "de-DE" ? "Tag" : "Day";
      case "week":
        return locale === "de-DE" ? "Woche" : "Week";
      case "month":
        return locale === "de-DE" ? "Monat" : "Month";
      case "1/4 year":
        return locale === "de-DE" ? "Quartal" : "Quarter";
      case "1/2 year":
        return locale === "de-DE" ? "Halbjahr" : "Half Year";
      case "year":
        return locale === "de-DE" ? "Jahr" : "Year";
    }
    return interval;
  };

  return (
    <Grid gutter="md">
      {/* Total Time Card */}
      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <WorkStatisticCard
          type="totalTime"
          value={formatTime(stats.totalTime)}
          subtitle={`Ø ${formatTime(stats.averageTime)} ${locale === "de-DE" ? "pro" : "per"} ${getIntervalString()}`}
          color="blue"
        />
      </Grid.Col>

      {/* Total Salary Card */}
      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <WorkStatisticCard
          type="totalSalary"
          value={formatCurrency(stats.totalSalary)}
          subtitle={`Ø ${formatCurrency(stats.averageSalary)} ${locale === "de-DE" ? "pro" : "per"} ${getIntervalString()}`}
          color="green"
        />
      </Grid.Col>

      {/* Hourly Rate Card */}
      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <WorkStatisticCard
          type="hourlyRate"
          value={formatCurrency(stats.hourlyRate)}
          subtitle={
            locale === "de-DE"
              ? "Durchschnittliche Stundenrate"
              : "Average hourly rate"
          }
          color="teal"
        />
      </Grid.Col>

      {/* Best Period Card */}
      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <WorkStatisticCard
          type="bestPeriod"
          value={stats.bestPeriod ? formatDate(stats.bestPeriod) : "-"}
          subtitle={locale === "de-DE" ? "Höchstes Gehalt" : "Highest Salary"}
          color="green"
        />
      </Grid.Col>

      {/* Worst Period Card */}
      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <WorkStatisticCard
          type="worstPeriod"
          value={stats.worstPeriod ? formatDate(stats.worstPeriod) : "-"}
          subtitle={locale === "de-DE" ? "Niedrigstes Gehalt" : "Lowest Salary"}
          color="red"
        />
      </Grid.Col>

      {/* Total Periods Card */}
      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <WorkStatisticCard
          type="totalPeriods"
          value={stats.totalPeriods.toString()}
          subtitle={locale === "de-DE" ? "Gesamtperiode" : "Total period"}
          color="blue"
        />
      </Grid.Col>
    </Grid>
  );
}
