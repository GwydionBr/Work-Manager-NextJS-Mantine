"use client";

import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useSettingsStore } from "@/stores/settingsStore";
import { useWorkStore } from "@/stores/workManagerStore";

import { Box, Modal, Stack, Text } from "@mantine/core";
import SessionForm from "@/components/Work/Session/SessionForm";
import { Currency } from "@/types/settings.types";
import { TablesInsert } from "@/types/db.types";

export default function NewSessionEvent({
  start,
  y,
  yToTime,
  onSubmit,
}: {
  start: number;
  y: number;
  yToTime: (y: number) => Date;
  onSubmit: () => void;
}) {
  const [modalOpened, { open, close }] = useDisclosure(false);
  const [submitting, setSubmitting] = useState(false);
  const {
    locale,
    defaultSalaryAmount,
    defaultProjectHourlyPayment,
    defaultSalaryCurrency,
  } = useSettingsStore();
  const { addTimerSession } = useWorkStore();

  const actualStart = Math.min(start, y);
  const actualEnd = Math.max(start, y);
  const isStartDynamic = start > y;
  const activeMiliseconds =
    new Date(yToTime(actualEnd)).getTime() -
    new Date(yToTime(actualStart)).getTime();
  const activeSeconds = activeMiliseconds / 1000;

  function handleClick() {
    open();
  }

  async function handleSubmit(values: {
    project_id?: string;
    start_time: string;
    end_time: string;
    active_seconds: number;
    paused_seconds: number;
    currency: Currency;
    salary: number;
    memo?: string;
  }) {
    setSubmitting(true);

    if (!values.project_id) {
      setSubmitting(false);
      return;
    }

    const newSession: TablesInsert<"timer_session"> = {
      ...values,
      start_time: new Date(values.start_time).toISOString(),
      end_time: new Date(values.end_time).toISOString(),
      true_end_time: new Date(values.end_time).toISOString(),
      memo: values.memo || null,
    };

    const success = await addTimerSession(newSession);
    if (success) {
      close();
      onSubmit();
    }
    setSubmitting(false);
  }

  return (
    <Box>
      <Stack
        onClick={handleClick}
        justify={isStartDynamic ? "flex-start" : "flex-end"}
        style={{
          position: "absolute",
          top: actualStart,
          height: actualEnd - actualStart,
          left: 0,
          right: 0,
          background:
            "light-dark(var(--mantine-color-teal-6), var(--mantine-color-teal-8))",
          borderTop: "3px solid var(--mantine-color-teal-6)",
        }}
      >
        {!isStartDynamic ? (
          <Text ta="center">
            {locale === "de-DE" ? "Zeitraum auswählen" : "Select timespan"}
          </Text>
        ) : null}
        <Text ta="center" fw={600}>
          {yToTime(actualStart).toLocaleTimeString(locale, {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          -{" "}
          {yToTime(actualEnd).toLocaleTimeString(locale, {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
        {isStartDynamic ? (
          <Text ta="center">
            {locale === "de-DE" ? "Zeitraum auswählen" : "Select timespan"}
          </Text>
        ) : null}
      </Stack>
      <Modal
        opened={modalOpened}
        onClose={close}
        title="Add Session"
        size="lg"
        padding="md"
      >
        <SessionForm
          initialValues={{
            start_time: yToTime(actualStart).toISOString(),
            end_time: yToTime(actualEnd).toISOString(),
            active_seconds: activeSeconds,
            paused_seconds: 0,
            currency: defaultSalaryCurrency,
            salary: defaultSalaryAmount,
            hourly_payment: defaultProjectHourlyPayment,
          }}
          onSubmit={handleSubmit}
          onCancel={close}
          newSession
          submitting={submitting}
        />
      </Modal>
    </Box>
  );
}
