import { Payout } from "@/types/finance.types";
import {
  Card,
  Text,
  Group,
  Stack,
  Badge,
  Divider,
  ThemeIcon,
  Tooltip,
  Flex,
  Box,
} from "@mantine/core";
import {
  IconCurrencyDollar,
  IconClock,
  IconCalendar,
  IconReceipt,
  IconFolder,
  IconUsers,
  IconTrendingUp,
  IconTrendingDown,
} from "@tabler/icons-react";

interface PayoutRowCardProps {
  payout: Payout;
}

export default function PayoutRowCard({ payout }: PayoutRowCardProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTotalSessionTime = () => {
    if (!payout.timer_sessions || payout.timer_sessions.length === 0)
      return null;

    const totalSeconds = payout.timer_sessions.reduce((acc, session) => {
      return acc + (session.active_seconds || 0);
    }, 0);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    return `${hours}h ${minutes}m`;
  };

  const hasCurrencyConversion =
    payout.end_currency && payout.end_currency !== payout.start_currency;
  const totalSessions = payout.timer_sessions?.length || 0;
  const totalTime = getTotalSessionTime();

  return (
    <Card
      withBorder
      radius="md"
      p="lg"
      shadow="sm"
      w="100%"
      maw={800}
      bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))"
      style={{ transition: "all 0.2s ease" }}
      className="hover:shadow-md"
    >
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <Box style={{ flex: 1 }}>
            <Text size="lg" fw={600} c="dimmed">
              {payout.title}
            </Text>
            <Text size="sm" c="dimmed">
              {formatDate(payout.created_at)}
            </Text>
          </Box>

          <Group gap="xs">
            {payout.cashflow && (
              <Badge
                color="green"
                variant="light"
                leftSection={<IconReceipt size={12} />}
              >
                Cashflow
              </Badge>
            )}
            {totalSessions > 0 && (
              <Badge
                color="blue"
                variant="light"
                leftSection={<IconClock size={12} />}
              >
                {totalSessions} Session{totalSessions !== 1 ? "s" : ""}
              </Badge>
            )}
          </Group>
        </Group>

        <Divider />

        {/* Financial Information */}
        <Group justify="space-between" align="center">
          <Stack gap="xs">
            <Text size="sm" c="dimmed" fw={500}>
              Auszahlungsbetrag
            </Text>
            <Group gap="xs" align="center">
              <ThemeIcon size="sm" color="green" variant="light">
                <IconCurrencyDollar size={14} />
              </ThemeIcon>
              <Text size="lg" fw={700} c="green">
                {formatCurrency(payout.start_value, payout.start_currency)}
              </Text>
            </Group>
          </Stack>

          {hasCurrencyConversion && (
            <>
              <Text size="sm" c="dimmed">
                →
              </Text>
              <Stack gap="xs" align="center">
                <Text size="sm" c="dimmed" fw={500}>
                  Nach Konvertierung
                </Text>
                <Group gap="xs" align="center">
                  <ThemeIcon size="sm" color="blue" variant="light">
                    <IconCurrencyDollar size={14} />
                  </ThemeIcon>
                  <Text size="lg" fw={700} c="blue">
                    {formatCurrency(payout.end_value!, payout.end_currency!)}
                  </Text>
                </Group>
              </Stack>
            </>
          )}
        </Group>

        {/* Additional Information */}
        <Group justify="space-between" wrap="wrap">
          {/* Timer Project */}
          {payout.timer_project && (
            <Group gap="xs" align="center">
              <ThemeIcon size="sm" color="violet" variant="light">
                <IconFolder size={14} />
              </ThemeIcon>
              <Box>
                <Text size="sm" fw={500}>
                  {payout.timer_project.title}
                </Text>
                <Text size="xs" c="dimmed">
                  Projekt
                </Text>
              </Box>
            </Group>
          )}

          {/* Total Time */}
          {totalTime && (
            <Group gap="xs" align="center">
              <ThemeIcon size="sm" color="orange" variant="light">
                <IconClock size={14} />
              </ThemeIcon>
              <Box>
                <Text size="sm" fw={500}>
                  {totalTime}
                </Text>
                <Text size="xs" c="dimmed">
                  Gesamtzeit
                </Text>
              </Box>
            </Group>
          )}

          {/* Cashflow Details */}
          {payout.cashflow && (
            <Group gap="xs" align="center">
              <ThemeIcon size="sm" color="teal" variant="light">
                <IconReceipt size={14} />
              </ThemeIcon>
              <Box>
                <Text size="sm" fw={500}>
                  {payout.cashflow.title}
                </Text>
                <Text size="xs" c="dimmed">
                  {formatCurrency(
                    payout.cashflow.amount,
                    payout.cashflow.currency
                  )}
                </Text>
              </Box>
            </Group>
          )}
        </Group>

        {/* Conversion Rate (if applicable) */}
        {hasCurrencyConversion && (
          <Box
            p="sm"
            style={{
              backgroundColor: "var(--mantine-color-blue-0)",
              borderRadius: "var(--mantine-radius-sm)",
              border: "1px solid var(--mantine-color-blue-2)",
            }}
          >
            <Group gap="xs" align="center">
              <ThemeIcon size="sm" color="blue" variant="light">
                {payout.end_value! > payout.start_value ? (
                  <IconTrendingUp size={14} />
                ) : (
                  <IconTrendingDown size={14} />
                )}
              </ThemeIcon>
              <Text size="sm" c="blue" fw={500}>
                Konvertierungsrate: 1 {payout.start_currency} ={" "}
                {(payout.end_value! / payout.start_value).toFixed(4)}{" "}
                {payout.end_currency}
              </Text>
            </Group>
          </Box>
        )}
      </Stack>
    </Card>
  );
}
