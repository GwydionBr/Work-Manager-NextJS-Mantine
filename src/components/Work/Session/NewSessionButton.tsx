"use client";

import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useWorkStore } from "@/stores/workManagerStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Box, Modal } from "@mantine/core";
import SessionForm from "@/components/Work/Session/SessionForm";
import AddActionIcon from "@/components/UI/ActionIcons/PlusActionIcon";

import { getTimeFragmentSession } from "@/utils/helper/getTimeFragmentSession";
import { formatTimeSpan } from "@/utils/formatFunctions";

import { TablesInsert } from "@/types/db.types";
import { Currency } from "@/types/settings.types";
import SessionNotification from "./SessionNotification";

export default function NewSessionButton() {
  const { locale, roundInTimeFragments, timeFragmentInterval } =
    useSettingsStore();
  const [opened, { open, close }] = useDisclosure(false);
  const { activeProjectId, addTimerSession } = useWorkStore();
  const activeProject = useWorkStore((state) =>
    state.projects.find((p) => p.project.id === activeProjectId)
  );
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(values: {
    start_time: string;
    end_time: string;
    active_seconds: number;
    paused_seconds: number;
    currency: Currency;
    salary: number;
    memo?: string;
  }) {
    if (!activeProject) {
      return;
    }
    setSubmitting(true);

    let newSession: TablesInsert<"timer_session"> = {
      ...values,
      user_id: activeProject.project.user_id,
      start_time: new Date(values.start_time).toISOString(),
      end_time: new Date(values.end_time).toISOString(),
      true_end_time: new Date(values.end_time).toISOString(),
      memo: values.memo || null,
      hourly_payment: activeProject.project.hourly_payment,
      salary: activeProject.project.hourly_payment ? values.salary : 0,
      currency: activeProject.project.hourly_payment
        ? values.currency
        : activeProject.project.currency,
    };

    if (roundInTimeFragments) {
      newSession = getTimeFragmentSession(timeFragmentInterval, newSession);
    }

    const { createdSessions, overlappingSessions, completeOverlap } =
      await addTimerSession(newSession);

    SessionNotification({
      originalSession: newSession,
      completeOverlap,
      createdSessions,
      overlappingSessions,
      locale,
      onCreatedSessions: () => {
        close();
      },
    });

    setSubmitting(false);
  }

  return (
    <Box>
      <Modal
        opened={opened}
        onClose={close}
        title={locale === "de-DE" ? "Sitzung hinzufügen" : "Add Session"}
        size="lg"
        padding="md"
      >
        <SessionForm
          initialValues={{
            project_id: activeProject?.project.id,
            start_time: new Date(new Date().setSeconds(0, 0)).toISOString(),
            end_time: new Date(new Date().setSeconds(0, 0)).toISOString(),
            active_seconds: 0,
            paused_seconds: 0,
            currency: activeProject?.project.currency || "USD",
            salary: activeProject?.project.hourly_payment
              ? activeProject?.project.salary || 0
              : 0,
          }}
          onSubmit={handleSubmit}
          onCancel={close}
          newSession
          project={activeProject?.project}
          submitting={submitting}
        />
      </Modal>

      <AddActionIcon
        aria-label={locale === "de-DE" ? "Sitzung hinzufügen" : "Add session"}
        onClick={open}
        size="md"
        tooltipLabel={locale === "de-DE" ? "Sitzung hinzufügen" : "Add session"}
      />
    </Box>
  );
}
