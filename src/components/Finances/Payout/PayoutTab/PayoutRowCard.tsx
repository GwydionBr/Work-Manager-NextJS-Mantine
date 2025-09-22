"use client";

import { useSettingsStore } from "@/stores/settingsStore";

import {
  Card,
  Text,
  Group,
  Stack,
  Badge,
  Divider,
  ThemeIcon,
  Box,
} from "@mantine/core";
import {
  IconCurrencyDollar,
  IconClock,
  IconReceipt,
  IconFolder,
  IconTrendingUp,
  IconTrendingDown,
} from "@tabler/icons-react";

import { formatDate, formatMoney } from "@/utils/formatFunctions";

import { Payout } from "@/types/finance.types";

interface PayoutRowCardProps {
  payout: Payout;
}

export default function PayoutRowCard({ payout }: PayoutRowCardProps) {
  const { locale } = useSettingsStore();

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
              {formatDate(new Date(payout.created_at), locale)}
            </Text>
          </Box>

          <Group gap="xs">
            {payout.cashflow && (
              <Badge
                color="green"
                variant="light"
                leftSection={<IconReceipt size={12} />}
              >
                {locale === "de-DE" ? "Cashflow" : "Cashflow"}
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
              {locale === "de-DE" ? "Auszahlungsbetrag" : "Payout Amount"}
            </Text>
            <Group gap="xs" align="center">
              <ThemeIcon size="sm" color="green" variant="light">
                <IconCurrencyDollar size={14} />
              </ThemeIcon>
              <Text size="lg" fw={700} c="green">
                {formatMoney(payout.start_value, payout.start_currency, locale)}
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
                  {locale === "de-DE"
                    ? "Nach Konvertierung"
                    : "After Conversion"}
                </Text>
                <Group gap="xs" align="center">
                  <ThemeIcon size="sm" color="blue" variant="light">
                    <IconCurrencyDollar size={14} />
                  </ThemeIcon>
                  <Text size="lg" fw={700} c="blue">
                    {formatMoney(
                      payout.end_value!,
                      payout.end_currency!,
                      locale
                    )}
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
                  {locale === "de-DE" ? "Projekt" : "Project"}
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
                  {locale === "de-DE" ? "Gesamtzeit" : "Total Time"}
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
                  {formatMoney(
                    payout.cashflow.amount,
                    payout.cashflow.currency,
                    locale
                  )}
                </Text>
              </Box>
            </Group>
          )}
        </Group>

        {/* Conversion Rate (if applicable) */}
        {hasCurrencyConversion && (
          <Card
            p="sm"
            withBorder
            radius="md"
            shadow="sm"
            bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))"
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
                {locale === "de-DE" ? "Konvertierungsrate" : "Conversion Rate"}:
                1 {payout.start_currency} ={" "}
                {(payout.end_value! / payout.start_value).toFixed(4)}{" "}
                {payout.end_currency}
              </Text>
            </Group>
          </Card>
        )}
      </Stack>
    </Card>
  );
}
