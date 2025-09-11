"use client";

import { useSettingsStore } from "@/stores/settingsStore";

import { Currency, RoundingDirection } from "@/types/settings.types";
import { Text, Group, Badge, Stack, Divider, HoverCard } from "@mantine/core";
import {
  IconCurrencyDollar,
  IconCurrencyEuro,
  IconClock,
  IconSettings,
  IconBuilding,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { formatMoney } from "@/utils/formatFunctions";
import InfoActionIcon from "@/components/UI/ActionIcons/InfoActionIcon";

interface TimeTrackerInfoHoverCardProps {
  currency: Currency;
  roundingDirection: RoundingDirection;
  roundingInterval: number;
  projectTitle: string;
  salary: number;
  hourlyPayment: boolean;
}

export default function TimeTrackerInfoHoverCard({
  currency,
  roundingDirection,
  roundingInterval,
  projectTitle,
  salary,
  hourlyPayment,
}: TimeTrackerInfoHoverCardProps) {
  const { locale } = useSettingsStore();
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

  const getRoundingDirectionLabel = (direction: RoundingDirection) => {
    switch (direction) {
      case "up":
        return locale === "de-DE" ? "Aufrunden" : "Round Up";
      case "down":
        return locale === "de-DE" ? "Abrunden" : "Round Down";
      case "nearest":
        return locale === "de-DE" ? "Am nächsten" : "Round Nearest";
      default:
        return direction;
    }
  };

  return (
    <HoverCard
      width={290}
      closeDelay={300}
      openDelay={150}
      position="bottom"
      radius="md"
      shadow="xl"
    >
      <HoverCard.Target>
        <InfoActionIcon onClick={() => {}} />
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Stack gap="md">
          {/* Project Title */}
          <Group>
            <IconBuilding size={16} color="var(--mantine-color-blue-6)" />
            <Text size="sm" fw={600} c="blue">
              {locale === "de-DE" ? "Projekt-Details" : "Project Details"}
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
                {locale === "de-DE" ? "Gehalt" : "Salary"}
              </Text>
            </Group>
            <Text size="sm" fw={600}>
              {formatMoney(salary, currency, locale)}
            </Text>
          </Group>

          {/* Payment Type */}
          <Group justify="space-between" align="center">
            <Text size="sm" c="dimmed">
              {locale === "de-DE" ? "Zahlungsart" : "Payment Type"}
            </Text>
            <Badge
              color={hourlyPayment ? "green" : "blue"}
              variant="light"
              size="sm"
              leftSection={
                hourlyPayment ? <IconCheck size={12} /> : <IconX size={12} />
              }
            >
              {hourlyPayment
                ? locale === "de-DE"
                  ? "Stündlich"
                  : "Hourly"
                : locale === "de-DE"
                  ? "Fest"
                  : "Fixed"}
            </Badge>
          </Group>

          <Divider />

          {/* Rounding Settings */}
          <Group>
            <IconSettings size={16} color="var(--mantine-color-orange-6)" />
            <Text size="sm" fw={600} c="orange">
              {locale === "de-DE" ? "Rundungs-Einstellungen" : "Rounding Settings"}
            </Text>
          </Group>

          <Group justify="space-between" align="center">
            <Text size="sm" c="dimmed">
              {locale === "de-DE" ? "Modus" : "Mode"}
            </Text>
            <Badge color="orange" variant="light" size="sm">
              {getRoundingDirectionLabel(roundingDirection)}
            </Badge>
          </Group>

          <Group justify="space-between" align="center">
            <Group gap="xs">
              <IconClock size={16} />
              <Text size="sm" c="dimmed">
                {locale === "de-DE" ? "Intervall" : "Interval"}
              </Text>
            </Group>
            <Text size="sm" fw={600}>
              {formatRoundingInterval(roundingInterval)}
            </Text>
          </Group>
        </Stack>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
