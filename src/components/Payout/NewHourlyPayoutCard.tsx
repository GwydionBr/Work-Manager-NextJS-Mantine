"use client";

import dayjs from "dayjs";

import { useState } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useDisclosure } from "@mantine/hooks";

import { Text, Stack, Card, Group } from "@mantine/core";
import { IconBrandCashapp } from "@tabler/icons-react";
import QuickPayoutButton from "@/components/Payout/QuickPayoutButton";
import PayoutModal from "@/components/Payout/Modal/PayoutModal";

import { Tables } from "@/types/db.types";
import { TimerProject } from "@/types/work.types";
import { Currency } from "@/types/settings.types";

interface NewHourlyPayoutCardProps {
  project: TimerProject;
}
export default function NewHourlyPayoutCard({
  project,
}: NewHourlyPayoutCardProps) {
  const { locale } = useSettingsStore();

  const [sessionPayouts, setSessionPayouts] = useState<
    Record<Currency, number>
  >({ [project.project.currency]: 0 } as Record<Currency, number>);
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);

  const [openedModal, { open: openModal, close: closeModal }] =
    useDisclosure(false);

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
    const sessionPayoutAmount = sessions.reduce((acc, session) => {
      return acc + session.salary * (session.active_seconds / 3600);
    }, 0);
    setSelectedSessionIds(selectedSessionIds);
    setSessionPayouts({
      [project.project.currency]: sessionPayoutAmount,
    } as Record<Currency, number>);
    openModal();
  };

  return (
    <Card withBorder radius="md" p="md" shadow="md" w="100%" maw={400}>
      <Card.Section>
        <Group p="md" gap="md">
          <IconBrandCashapp />
          <Text size="sm" fw={500}>
            {locale === "de-DE" ? "Schnelle Auszahlung" : "Quick Payout"}
          </Text>
        </Group>
      </Card.Section>
      <Card.Section>
        <Stack p="md" gap="md">
          <QuickPayoutButton
            label={locale === "de-DE" ? "Gesamter Zeitraum" : "All time"}
            sessions={allTimeSessions}
            salary={project.project.salary}
            currency={project.project.currency}
            timeSpan={[null, null]}
            handleClick={handlePayoutClick}
          />
          <QuickPayoutButton
            label={locale === "de-DE" ? "Dieser Monat" : "This month"}
            sessions={thisMonthSessions}
            salary={project.project.salary}
            currency={project.project.currency}
            timeSpan={[
              today.startOf("month").toDate(),
              today.toDate(),
            ]}
            handleClick={handlePayoutClick}
          />
          <QuickPayoutButton
            label={locale === "de-DE" ? "Letzter Monat" : "Last month"}
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
      <PayoutModal
        opened={openedModal}
        handleClose={closeModal}
        sessionPayouts={sessionPayouts}
        sessionIds={selectedSessionIds}
        payoutCategoryId={project.project.cash_flow_category_id}
      />
    </Card>
  );
}
