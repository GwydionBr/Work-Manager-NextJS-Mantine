import { Grid } from "@mantine/core";
import StatisticCard from "./StatisticCard";
import { ChartStats } from "@/hooks/useFinanceChartData";
import { FinanceInterval } from "@/types/settings.types";

/**
 * Props for the StatisticsCards component
 */
interface StatisticsCardsProps {
  stats: ChartStats;
  interval: FinanceInterval;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
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
  formatCurrency,
  formatDate,
}: StatisticsCardsProps) {
  return (
    <Grid gutter="md">
      {/* Total Income Card */}
      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <StatisticCard
          type="totalIncome"
          value={formatCurrency(stats.totalIncome)}
          subtitle={`Ø ${formatCurrency(stats.averageIncome)} per ${interval}`}
          color="teal"
        />
      </Grid.Col>

      {/* Total Expenses Card */}
      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <StatisticCard
          type="totalExpense"
          value={formatCurrency(stats.totalExpense)}
          subtitle={`Ø ${formatCurrency(stats.averageExpense)} per ${interval}`}
          color="red"
        />
      </Grid.Col>

      {/* Net Amount Card */}
      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <StatisticCard
          type="net"
          value={formatCurrency(stats.netAmount)}
          color={stats.netAmount >= 0 ? "green" : "red"}
          badge={stats.netAmount >= 0 ? "Profit" : "Loss"}
          badgeColor={stats.netAmount >= 0 ? "green" : "red"}
        />
      </Grid.Col>

      {/* Profit Margin Card */}
      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <StatisticCard
          type="profitMargin"
          value={`${stats.profitMargin.toFixed(1)}%`}
          subtitle={`${stats.totalPeriods} periods`}
          color={stats.profitMargin >= 0 ? "green" : "red"}
        />
      </Grid.Col>

      {/* Best Period Card */}
      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <StatisticCard
          type="bestPeriod"
          value={stats.bestMonth ? formatDate(stats.bestMonth) : "-"}
          subtitle="Highest Net Value"
          color="green"
        />
      </Grid.Col>

      {/* Worst Period Card */}
      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <StatisticCard
          type="worstPeriod"
          value={stats.worstMonth ? formatDate(stats.worstMonth) : "-"}
          subtitle="Lowest Net Value"
          color="red"
        />
      </Grid.Col>
    </Grid>
  );
}
