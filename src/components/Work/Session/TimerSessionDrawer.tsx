"use client";

import { useState } from "react";
import { useWorkStore } from "@/stores/workManagerStore";

import { Drawer, Flex } from "@mantine/core";
import SessionForm from "@/components/Work/Session/SessionForm";

import { Currency } from "@/types/settings.types";
import { Tables } from "@/types/db.types";

interface TimerSessionModalProps {
  timerSession: Tables<"timer_session">;
  opened: boolean;
  close: () => void;
}

export default function TimerSessionDrawer({
  timerSession,
  opened,
  close,
}: TimerSessionModalProps) {
  const { updateTimerSession, projects } = useWorkStore();
  const [submitting, setSubmitting] = useState(false);

  // Find the project for this session
  const project = projects.find(
    (p) => p.project.id === timerSession.project_id
  )?.project;

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

    const newSession: Tables<"timer_session"> = {
      ...values,
      real_start_time: timerSession.real_start_time,
      true_end_time: timerSession.true_end_time,
      created_at: new Date().toISOString(),
      id: timerSession.id,
      project_id: values.project_id || timerSession.project_id,
      user_id: timerSession.user_id,
      start_time: new Date(values.start_time).toISOString(),
      hourly_payment: timerSession.hourly_payment,
      end_time: new Date(values.end_time).toISOString(),
      payed: false,
      // If project doesn't have hourly payment, set salary to 0 and currency to project currency
      salary: project?.hourly_payment ? values.salary : 0,
      currency: project?.hourly_payment
        ? values.currency
        : project?.currency || timerSession.currency,
      payout_id: null,
      memo: values.memo || null,
    };

    const success = await updateTimerSession(newSession);
    if (success) {
      close();
    }
    setSubmitting(false);
  }

  return (
    <Drawer
      opened={opened}
      onClose={close}
      title="Edit Timer-Session"
      size="md"
      padding="md"
    >
      <Flex direction="column" gap="xl">
        <SessionForm
          initialValues={{
            project_id: timerSession.project_id,
            start_time: timerSession.start_time,
            end_time: timerSession.end_time,
            active_seconds: timerSession.active_seconds,
            paused_seconds: timerSession.paused_seconds,
            currency: project?.hourly_payment
              ? timerSession.currency
              : project?.currency || timerSession.currency,
            salary: project?.hourly_payment ? timerSession.salary : 0,
            memo: timerSession.memo || undefined,
          }}
          onSubmit={handleSubmit}
          onCancel={close}
          newSession={false}
          project={project}
          submitting={submitting}
        />
      </Flex>
    </Drawer>
  );
}
