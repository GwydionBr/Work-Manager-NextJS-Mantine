import { Card, Text, Badge, Group } from "@mantine/core";
import {
  IconCash,
  IconReceipt,
  IconChartBar,
  IconTrendingUp,
  IconTrophy,
  IconAlertTriangle,
} from "@tabler/icons-react";

/**
 * Types of statistic cards that can be displayed
 */
export type StatisticType =
  | "totalIncome"
  | "totalExpense"
  | "net"
  | "profitMargin"
  | "bestPeriod"
  | "worstPeriod";

/**
 * Props for the StatisticCard component
 */
interface StatisticCardProps {
  type: StatisticType;
  value: string | number;
  subtitle?: string;
  color?: "teal" | "red" | "green" | "blue";
  badge?: string;
  badgeColor?: "green" | "red";
}

/**
 * Reusable statistic card component
 * Displays financial statistics in a consistent card format
 */
export default function StatisticCard({
  type,
  value,
  subtitle,
  color = "green",
  badge,
  badgeColor = "green",
}: StatisticCardProps) {
  // Get title and default styling based on type
  const getCardConfig = () => {
    switch (type) {
      case "totalIncome":
        return {
          title: "Total Income",
          defaultColor: "teal" as const,
          icon: IconCash,
        };
      case "totalExpense":
        return {
          title: "Total Expenses",
          defaultColor: "red" as const,
          icon: IconReceipt,
        };
      case "net":
        return {
          title: "Net",
          defaultColor: "green" as const,
          icon: IconChartBar,
        };
      case "profitMargin":
        return {
          title: "Profit Margin",
          defaultColor: "green" as const,
          icon: IconTrendingUp,
        };
      case "bestPeriod":
        return {
          title: "Best Period",
          defaultColor: "green" as const,
          icon: IconTrophy,
        };
      case "worstPeriod":
        return {
          title: "Worst Period",
          defaultColor: "red" as const,
          icon: IconAlertTriangle,
        };
      default:
        return {
          title: "Statistic",
          defaultColor: "blue" as const,
          icon: IconChartBar,
        };
    }
  };

  const config = getCardConfig();
  const displayColor = color || config.defaultColor;
  const IconComponent = config.icon;

  return (
    <Card withBorder p="md" h="100%">
      <Group mb="xs">
        <IconComponent
          size={16}
          color={`var(--mantine-color-${displayColor}-6)`}
        />
        <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
          {config.title}
        </Text>
      </Group>
      <Group>
        <Text size="xl" fw={700} c={displayColor}>
          {value}
        </Text>
        {badge && (
          <Badge color={badgeColor} variant="light" mt="xs">
            {badge}
          </Badge>
        )}
      </Group>
      {subtitle && (
        <Text size="xs" c="dimmed">
          {subtitle}
        </Text>
      )}
    </Card>
  );
}
