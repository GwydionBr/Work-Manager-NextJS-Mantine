"use client";
import dayjs from "dayjs";

import { useSettingsStore } from "@/stores/settingsStore";

import { Button, Card, Divider, Text, Stack } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { Tables } from "@/types/db.types";
import { IconBrandCashapp, IconSquareRoundedCheck } from "@tabler/icons-react";
import { formatMoney } from "@/utils/formatFunctions";

interface ProjectFilterProps {
  timeSpan: [Date | null, Date | null];
  sessions: Tables<"timer_session">[];
  project: Tables<"timer_project">;
  isProcessingPayout: boolean;
  onTimeSpanChange: (timeSpan: [Date | null, Date | null]) => void;
  onSelectAll: () => void;
  handleSessionPayoutClick: (sessions: Tables<"timer_session">[]) => void;
}

export default function ProjectFilter({
  timeSpan,
  sessions,
  project,
  isProcessingPayout,
  onTimeSpanChange,
  onSelectAll,
  handleSessionPayoutClick,
}: ProjectFilterProps) {
  const { locale } = useSettingsStore();
  const today = dayjs();
  const unpaidSessions = sessions.filter((session) => !session.paid);

  const sessionPayout = unpaidSessions.reduce(
    (acc, session) => acc + session.salary * (session.active_seconds / 3600),
    0
  );

  function handlePayoutClick() {
    if (!project.hourly_payment) {
      // TODO: Implement project payout
    } else if (sessionPayout > 0) {
      handleSessionPayoutClick(sessions.filter((session) => !session.paid));
    }
  }

  return (
    <Card withBorder mb="sm" shadow="md" p="md" radius="md" maw={320}>
      <Stack>
        <DatePickerInput
          maw={300}
          label={
            locale === "de-DE"
              ? "Filter nach Zeitrahmen"
              : "Filter by time period"
          }
          clearable
          type="range"
          maxDate={today.add(1, "day").toDate()}
          placeholder={
            locale === "de-DE"
              ? "Datum auswählen um nach zeitraum zu filtern"
              : "Select date to filter by time period"
          }
          allowSingleDateInRange
          valueFormat={locale === "de-DE" ? "DD. MMM YYYY" : "MMM DD, YYYY"}
          value={timeSpan}
          onChange={(value) => {
            onTimeSpanChange(value as [Date | null, Date | null]);
          }}
          presets={[
            {
              value: [
                today.subtract(7, "day").format("YYYY-MM-DD"),
                today.format("YYYY-MM-DD"),
              ],
              label: locale === "de-DE" ? "Letzte 7 Tage" : "Last 7 days",
            },
            {
              value: [
                today.startOf("week").add(1, "day").format("YYYY-MM-DD"),
                today.format("YYYY-MM-DD"),
              ],
              label: locale === "de-DE" ? "Diese Woche" : "This week",
            },
            {
              value: [
                today
                  .startOf("week")
                  .subtract(1, "week")
                  .add(1, "day")
                  .format("YYYY-MM-DD"),
                today
                  .endOf("week")
                  .subtract(1, "week")
                  .add(1, "day")
                  .format("YYYY-MM-DD"),
              ],
              label: locale === "de-DE" ? "Vergangene Woche" : "Previous week",
            },
            {
              value: [
                today.startOf("month").format("YYYY-MM-DD"),
                today.format("YYYY-MM-DD"),
              ],
              label: locale === "de-DE" ? "Dieser Monat" : "This month",
            },
            {
              value: [
                today
                  .subtract(1, "month")
                  .startOf("month")
                  .format("YYYY-MM-DD"),
                today.subtract(1, "month").endOf("month").format("YYYY-MM-DD"),
              ],
              label:
                locale === "de-DE" ? "Vergangener Monat" : "Previous month",
            },
            {
              value: [
                today
                  .subtract(2, "month")
                  .startOf("month")
                  .format("YYYY-MM-DD"),
                today.format("YYYY-MM-DD"),
              ],
              label: locale === "de-DE" ? "Letzten 3 Monate" : "Last 3 months",
            },
          ]}
        />
        <Stack gap={5} mt="md">
          <Text size="xs" c="dimmed" fw={500}>
            {locale === "de-DE" ? "Schnellaktionen" : "Quick Actions"}
          </Text>
          <Divider />
        </Stack>
        <Button
          color="violet"
          onClick={handlePayoutClick}
          disabled={sessionPayout <= 0}
          leftSection={<IconBrandCashapp />}
          loading={isProcessingPayout}
        >
          {locale === "de-DE" ? "" : "Payout"}{" "}
          {formatMoney(sessionPayout, project.currency, locale)}{" "}
          {locale === "de-DE" ? "Auszahlen" : ""}
        </Button>
        <Button
          variant="outline"
          leftSection={<IconSquareRoundedCheck />}
          onClick={onSelectAll}
        >
          {locale === "de-DE" ? "Alle auswählen" : "Select All"}
        </Button>
      </Stack>
    </Card>
  );
}
