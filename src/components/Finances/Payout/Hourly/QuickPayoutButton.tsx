"use client";

import { useSettingsStore } from "@/stores/settingsStore";
import { useHover } from "@mantine/hooks";

import { Group, Stack, Text, alpha, UnstyledButton, UnstyledButtonProps } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";

import { formatDate, formatMoney } from "@/utils/formatFunctions";

import { Tables } from "@/types/db.types";
import { Currency } from "@/types/settings.types";

interface QuickPayoutButtonProps extends UnstyledButtonProps {
  label: string;
  sessions: Tables<"timer_session">[];
  salary: number;
  currency: Currency;
  timeSpan: [Date | null, Date | null];
  handleClick: (unpaidSessions: Tables<"timer_session">[]) => void;
}

export default function QuickPayoutButton({
  label,
  sessions,
  salary,
  currency,
  timeSpan,
  handleClick,
  ...props
}: QuickPayoutButtonProps) {
  const { locale } = useSettingsStore();
  const { hovered, ref } = useHover();

  const unpaidSessions = sessions.filter((session) => !session.paid);
  const unpaidTotal = unpaidSessions.reduce(
    (acc, session) => acc + salary * (session.active_seconds / 3600),
    0
  );

  return (
    <UnstyledButton
      ref={ref}
      onClick={() => handleClick(unpaidSessions)}
      bg={hovered ? alpha("var(--mantine-color-teal-5)", 0.1) : "transparent"}
      style={{
        border: "1px solid var(--mantine-color-teal-5)",
        borderRadius: 10,
        padding: 10,
        transition: "background-color 0.2s ease-in-out",
        pointerEvents: unpaidTotal <= 0 ? "none" : "auto",
        opacity: unpaidTotal <= 0 ? 0.5 : 1,
      }}
      disabled={unpaidTotal <= 0}
      {...props}
    >
      <Group justify="space-between">
        <Stack>
          <Group justify="space-between">
            <Text>{label}</Text>
            <Text size="xs" c="dimmed">
              {unpaidSessions.length}{" "}
              {locale === "de-DE" ? "Sitzungen" : "Sessions"}
            </Text>
          </Group>
          {timeSpan[0] && timeSpan[1] && (
            <Group>
              <Text size="xs" c="dimmed">
                {formatDate(timeSpan[0], locale)} -{" "}
                {formatDate(timeSpan[1], locale)}
              </Text>
            </Group>
          )}
        </Stack>
        <Group>
          <Text>{formatMoney(unpaidTotal, currency, locale)}</Text>
          <IconChevronRight />
        </Group>
      </Group>
    </UnstyledButton>
  );
}
