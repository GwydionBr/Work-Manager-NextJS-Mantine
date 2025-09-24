"use client";

import dayjs from "dayjs";

import { useSettingsStore } from "@/stores/settingsStore";

import { Text, Stack, Card, Group, Loader } from "@mantine/core";
import { IconBrandCashapp } from "@tabler/icons-react";
import QuickPayoutButton from "@/components/Finances/Payout/Hourly/QuickPayoutButton";

import { Tables } from "@/types/db.types";
import { TimerProject } from "@/types/work.types";
import { Currency } from "@/types/settings.types";

interface HourlyPayoutCardProps {
  project: TimerProject;
  onSubmit: (values: {
    selectedSessionIds: string[];
    startValue: number;
    endValue: number | null;
    endCurrency: Currency | null;
    project: Tables<"timer_project">;
  }) => void;
  setPayoutSessionIds: (sessionIds: string[]) => void;
  setPayoutStartValue: (startValue: number) => void;
  openModal: () => void;
  isProcessing: boolean;
}
export default function HourlyPayoutCard({
  project,
  isProcessing,
  onSubmit,
  setPayoutSessionIds,
  setPayoutStartValue,  
  openModal,
}: HourlyPayoutCardProps) {
  const { defaultFinanceCurrency, showChangeCurrencyWindow, getLocalizedText } =
    useSettingsStore();

  const today = dayjs();

  const thisMonthSessions = project.sessions.filter((session) => {
    return dayjs(session.start_time).isSame(today, "month");
  });
  const lastMonthSessions = project.sessions.filter((session) => {
    return dayjs(session.start_time).isSame(
      today.subtract(1, "month"),
      "month"
    );
  });
  const allTimeSessions = project.sessions;

  const handlePayoutClick = (sessions: Tables<"timer_session">[]) => {
    const selectedSessionIds = sessions.map((session) => session.id);
    setPayoutSessionIds(selectedSessionIds);
    const sessionPayoutAmount = sessions.reduce((acc, session) => {
      return acc + session.salary * (session.active_seconds / 3600);
    }, 0);
    setPayoutStartValue(sessionPayoutAmount);
    if (
      showChangeCurrencyWindow === null ||
      (showChangeCurrencyWindow === true &&
        project.project.currency !== defaultFinanceCurrency)
    ) {
      openModal();
    } else {
      onSubmit({
        selectedSessionIds,
        startValue: sessionPayoutAmount,
        endValue: null,
        endCurrency: null,
        project: project.project,
      });
    }
  };

  return (
    <Card withBorder radius="md" mb="md" p="md" shadow="md" w="100%" maw={400}>
      <Card.Section>
        <Group p="md" gap="md">
          <IconBrandCashapp />
          <Text size="sm" fw={500}>
            {getLocalizedText("Schnelle Auszahlung", "Quick Payout")}
          </Text>
          {isProcessing && <Loader size="xs" />}
        </Group>
      </Card.Section>
      <Card.Section>
        <Stack p="md" gap="md">
          <QuickPayoutButton
            label={getLocalizedText("Gesamter Zeitraum", "All time")}
            sessions={allTimeSessions}
            salary={project.project.salary}
            currency={project.project.currency}
            timeSpan={[null, null]}
            handleClick={handlePayoutClick}
          />
          <QuickPayoutButton
            label={getLocalizedText("Dieser Monat", "This month")}
            sessions={thisMonthSessions}
            salary={project.project.salary}
            currency={project.project.currency}
            timeSpan={[today.startOf("month").toDate(), today.toDate()]}
            handleClick={handlePayoutClick}
          />
          <QuickPayoutButton
            label={getLocalizedText("Letzter Monat", "Last month")}
            sessions={lastMonthSessions}
            salary={project.project.salary}
            currency={project.project.currency}
            timeSpan={[
              today.subtract(1, "month").startOf("month").toDate(),
              today.subtract(1, "month").endOf("month").toDate(),
            ]}
            handleClick={handlePayoutClick}
          />
        </Stack>
      </Card.Section>
    </Card>
  );
}
