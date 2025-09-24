"use client";

import dayjs from "dayjs";

import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useSettingsStore } from "@/stores/settingsStore";
import { useFinanceStore } from "@/stores/financeStore";
import { useWorkStore } from "@/stores/workManagerStore";

import { Text, Stack, Card, Group, Loader } from "@mantine/core";
import { IconBrandCashapp } from "@tabler/icons-react";
import QuickPayoutButton from "@/components/Finances/Payout/Hourly/QuickPayoutButton";

import { Tables } from "@/types/db.types";
import { TimerProject } from "@/types/work.types";
import { Currency } from "@/types/settings.types";
import HourlyPayoutModal from "./HourlyPayoutModal";
import { formatDate } from "@/utils/formatFunctions";
import {
  showActionSuccessNotification,
  showActionErrorNotification,
} from "@/utils/notificationFunctions";

interface HourlyPayoutCardProps {
  project: TimerProject;
}
export default function HourlyPayoutCard({ project }: HourlyPayoutCardProps) {
  const {
    locale,
    defaultFinanceCurrency,
    showChangeCurrencyWindow,
    getLocalizedText,
  } = useSettingsStore();
  const { payoutWorkSessions } = useWorkStore();
  const { sessionPayout } = useFinanceStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
  const [startValue, setStartValue] = useState<number>(0);

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
    setSelectedSessionIds(selectedSessionIds);
    const sessionPayoutAmount = sessions.reduce((acc, session) => {
      return acc + session.salary * (session.active_seconds / 3600);
    }, 0);
    setStartValue(sessionPayoutAmount);
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
      });
    }
  };

  async function onSubmit(values: {
    selectedSessionIds?: string[];
    startValue?: number;
    endValue: number | null;
    endCurrency: Currency | null;
  }) {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // Create a timeout promise that rejects after 15 seconds
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(
            new Error(
              locale === "de-DE"
                ? "Die Auszahlung dauert zu lange. Bitte versuchen Sie es erneut."
                : "Payout is taking too long. Please try again."
            )
          );
        }, 15000); // 15 seconds timeout
      });

      // Race between the payout operation and the timeout
      const title = `Payout (${project.project.title}) ${formatDate(new Date(), locale)}`;
      const categoryIds = project.project.cash_flow_category_id
        ? [project.project.cash_flow_category_id]
        : [];
      const payoutResult = await Promise.race([
        sessionPayout(
          values.selectedSessionIds ?? selectedSessionIds,
          {
            title,
            start_value: values.startValue ?? startValue,
            start_currency: project.project.currency,
            end_value: values.endValue,
            end_currency: values.endCurrency,
            timer_session_project_id: project.project.id,
          },
          categoryIds
        ),
        timeoutPromise,
      ]);

      if (payoutResult) {
        payoutWorkSessions(
          values.selectedSessionIds ?? selectedSessionIds,
          payoutResult.id
        );
        showActionSuccessNotification(
          locale === "de-DE" ? "Auszahlung erfolgreich" : "Payout successful",
          locale
        );
        closeModal();
      } else {
        showActionErrorNotification(
          locale === "de-DE" ? "Auszahlung fehlgeschlagen" : "Payout failed",
          locale
        );
      }
    } catch (error) {
      showActionErrorNotification(
        locale === "de-DE"
          ? "Auszahlung hat zu lange gedauert. Bitte versuchen Sie es erneut."
          : "Payout took too long. Please try again.",
        locale
      );
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <Card withBorder radius="md" mb="md" p="md" shadow="md" w="100%" maw={400}>
      <Card.Section>
        <Group p="md" gap="md">
          <IconBrandCashapp />
          <Text size="sm" fw={500}>
            {locale === "de-DE" ? "Schnelle Auszahlung" : "Quick Payout"}
          </Text>
          {isProcessing && <Loader size="xs" />}
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
            timeSpan={[today.startOf("month").toDate(), today.toDate()]}
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
      <HourlyPayoutModal
        opened={openedModal}
        handleClose={closeModal}
        onSubmit={onSubmit}
        isProcessing={isProcessing}
        startValue={startValue}
        startCurrency={project.project.currency}
      />
    </Card>
  );
}
