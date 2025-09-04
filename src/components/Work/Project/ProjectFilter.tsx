"use client";
import dayjs from "dayjs";

import { useDisclosure } from "@mantine/hooks";
import { useSettingsStore } from "@/stores/settingsStore";

import { Button, Card, Divider, Text, Stack } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import PayoutModal from "@/components/Payout/Modal/PayoutModal";
import { Currency } from "@/types/settings.types";
import { Tables } from "@/types/db.types";
import { IconBrandCashapp } from "@tabler/icons-react";
import { formatMoney } from "@/utils/formatFunctions";

interface ProjectFilterProps {
  timeSpan: [Date | null, Date | null];
  onTimeSpanChange: (timeSpan: [Date | null, Date | null]) => void;
  sessions: Tables<"timer_session">[];
  project: Tables<"timer_project">;
  openPayout: () => void;
}

export default function ProjectFilter({
  timeSpan,
  onTimeSpanChange,
  sessions,
  project,
  openPayout,
}: ProjectFilterProps) {
  const { locale } = useSettingsStore();
  const [openedModal, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const today = dayjs();
  const paidSessions = sessions.filter((session) => session.payed);
  const unpaidSessions = sessions.filter((session) => !session.payed);

  const sessionPayout = unpaidSessions.reduce(
    (acc, session) => acc + session.salary * (session.active_seconds / 3600),
    0
  );

  function handlePayoutClick() {
    if (!project.hourly_payment) {
      openPayout();
    } else if (sessionPayout > 0) {
      openModal();
    }
  }

  return (
    <Card withBorder shadow="md" p="md" radius="md" maw={320}>
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
                today.subtract(2, "day").format("YYYY-MM-DD"),
                today.format("YYYY-MM-DD"),
              ],
              label: locale === "de-DE" ? "Letzte 2 Tage" : "Last 2 days",
            },
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
                today.endOf("week").add(1, "day").format("YYYY-MM-DD"),
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
              label: locale === "de-DE" ? "Letzte Woche" : "Last week",
            },
            {
              value: [
                today.startOf("month").format("YYYY-MM-DD"),
                today.endOf("month").format("YYYY-MM-DD"),
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
              label: locale === "de-DE" ? "Letzter Monat" : "Last month",
            },
          ]}
        />
        <Stack gap={5} mt="md">
          <Text size="xs" c="dimmed" fw={500}>
            {locale === "de-DE" ? "Schnellaktionen" : "Quick Actions"}
          </Text>
          <Divider />
        </Stack>
        <Button onClick={handlePayoutClick} leftSection={<IconBrandCashapp />}>
          Payout {formatMoney(sessionPayout, project.currency, locale)}
        </Button>
      </Stack>
      <PayoutModal
        opened={openedModal}
        handleClose={closeModal}
        sessionPayouts={
          {
            [project.currency]: sessionPayout,
          } as Record<Currency, number>
        }
        sessionIds={unpaidSessions.map((session) => session.id)}
        payoutCategoryId={project.cash_flow_category_id}
      />
    </Card>
  );
}
