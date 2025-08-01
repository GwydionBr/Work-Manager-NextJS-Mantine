import { RoundingDirection, Currency } from "@/types/settings.types";
import { Card, Text, Group, Badge, Stack, Divider } from "@mantine/core";
import {
  IconCurrencyDollar,
  IconCurrencyEuro,
  IconClock,
  IconSettings,
  IconBuilding,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { formatMoney, getCurrencySymbol } from "@/utils/workHelperFunctions";

interface TimeTrackerInfoCardProps {
  projectTitle: string;
  salary: number;
  hourlyPayment: boolean;
  currency: Currency;
  roundingMode: RoundingDirection;
  roundingInterval: number;
}

export default function TimeTrackerInfoCard({
  projectTitle,
  salary,
  hourlyPayment,
  currency,
  roundingMode,
  roundingInterval,
}: TimeTrackerInfoCardProps) {
  const getCurrencyIcon = () => {
    return currency === "EUR" ? (
      <IconCurrencyEuro size={16} />
    ) : (
      <IconCurrencyDollar size={16} />
    );
  };

  const formatRoundingInterval = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  const getRoundingModeLabel = (mode: RoundingDirection) => {
    switch (mode) {
      case "up":
        return "Round Up";
      case "down":
        return "Round Down";
      case "nearest":
        return "Round Nearest";
      default:
        return mode;
    }
  };

  return (
    <Stack gap="md">
      {/* Project Title */}
      <Group>
        <IconBuilding size={16} color="var(--mantine-color-blue-6)" />
        <Text size="sm" fw={600} c="blue">
          Project Details
        </Text>
      </Group>

      <Text size="lg" fw={700} ta="center">
        {projectTitle}
      </Text>

      <Divider />

      {/* Salary Information */}
      <Group justify="space-between" align="center">
        <Group gap="xs">
          {getCurrencyIcon()}
          <Text size="sm" c="dimmed">
            Salary
          </Text>
        </Group>
        <Text size="sm" fw={600}>
          {formatMoney(salary, getCurrencySymbol(currency))}
        </Text>
      </Group>

      {/* Payment Type */}
      <Group justify="space-between" align="center">
        <Text size="sm" c="dimmed">
          Payment Type
        </Text>
        <Badge
          color={hourlyPayment ? "green" : "blue"}
          variant="light"
          size="sm"
          leftSection={
            hourlyPayment ? <IconCheck size={12} /> : <IconX size={12} />
          }
        >
          {hourlyPayment ? "Hourly" : "Fixed"}
        </Badge>
      </Group>

      <Divider />

      {/* Rounding Settings */}
      <Group>
        <IconSettings size={16} color="var(--mantine-color-orange-6)" />
        <Text size="sm" fw={600} c="orange">
          Rounding Settings
        </Text>
      </Group>

      <Group justify="space-between" align="center">
        <Text size="sm" c="dimmed">
          Mode
        </Text>
        <Badge color="orange" variant="light" size="sm">
          {getRoundingModeLabel(roundingMode)}
        </Badge>
      </Group>

      <Group justify="space-between" align="center">
        <Group gap="xs">
          <IconClock size={16} />
          <Text size="sm" c="dimmed">
            Interval
          </Text>
        </Group>
        <Text size="sm" fw={600}>
          {formatRoundingInterval(roundingInterval)}
        </Text>
      </Group>
    </Stack>
  );
}
