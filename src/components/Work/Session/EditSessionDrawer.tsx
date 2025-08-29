"use client";

import { useEffect, useState } from "react";
import { useWorkStore } from "@/stores/workManagerStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Drawer, Flex, Group, Text, useDrawersStack, Box } from "@mantine/core";
import { IconExclamationMark } from "@tabler/icons-react";
import SessionForm from "@/components/Work/Session/SessionForm";

import { Currency } from "@/types/settings.types";
import { Tables } from "@/types/db.types";
import DeleteActionIcon from "@/components/UI/ActionIcons/DeleteActionIcon";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import DeleteButton from "@/components/UI/Buttons/DeleteButton";

interface TimerSessionModalProps {
  timerSession: Tables<"timer_session">;
  opened: boolean;
  onClose: () => void;
}

export default function EditSessionDrawer({
  timerSession,
  opened,
  onClose,
}: TimerSessionModalProps) {
  const { locale } = useSettingsStore();
  const { updateTimerSession, projects, deleteTimerSession } = useWorkStore();
  const [submitting, setSubmitting] = useState(false);

  const drawerStack = useDrawersStack(["edit-session", "delete-session"]);

  // Sync external opened state with internal drawer stack
  useEffect(() => {
    if (opened) {
      drawerStack.open("edit-session");
    } else {
      drawerStack.closeAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  // Find the project for this session
  const project = projects.find(
    (p) => p.project.id === timerSession.project_id
  )?.project;

  function handleClose() {
    drawerStack.closeAll();
    onClose();
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
      time_fragments_interval: timerSession.time_fragments_interval,
    };

    const success = await updateTimerSession(newSession);
    if (success) {
      handleClose();
    }
    setSubmitting(false);
  }
  async function handleDelete() {
    const success = await deleteTimerSession(timerSession.id);
    if (success) {
      handleClose();
    }
  }

  return (
    <Box>
      <Drawer.Stack>
        <Drawer
          {...drawerStack.register("edit-session")}
          onClose={handleClose}
          title={
            <Group>
              <DeleteActionIcon
                tooltipLabel={
                  locale === "de-DE" ? "Sitzung löschen" : "Delete Session"
                }
                onClick={() => {
                  drawerStack.open("delete-session");
                }}
              />
              <Text>
                {locale === "de-DE"
                  ? "Sitzung bearbeiten"
                  : "Edit Timer-Session"}
              </Text>
            </Group>
          }
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
              onCancel={handleClose}
              newSession={false}
              project={project}
              submitting={submitting}
            />
          </Flex>
        </Drawer>
        <Drawer
          {...drawerStack.register("delete-session")}
          onClose={handleClose}
          title={
            <Group>
              <IconExclamationMark size={25} color="red" />
              <Text>
                {locale === "de-DE" ? "Sitzung löschen" : "Delete Session"}
              </Text>
            </Group>
          }
        >
          <Text>
            {locale === "de-DE"
              ? "Bist du dir sicher, dass du diese Sitzung löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden. "
              : "Are you sure you want to delete this session? This action cannot be undone."}
          </Text>
          <Group mt="md" justify="flex-end" gap="sm">
            <CancelButton onClick={handleClose} color="teal" />
            <DeleteButton
              onClick={handleDelete}
              tooltipLabel={
                locale === "de-DE" ? "Sitzung löschen" : "Delete Session"
              }
            />
          </Group>
        </Drawer>
      </Drawer.Stack>
    </Box>
  );
}
