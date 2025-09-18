"use client";

import { useEffect, useState } from "react";
import { useWorkStore } from "@/stores/workManagerStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Drawer, Flex, Group, Text, useDrawersStack, Box } from "@mantine/core";
import { IconAlertCircle, IconExclamationMark } from "@tabler/icons-react";
import SessionForm from "@/components/Work/Session/SessionForm";

import { Currency } from "@/types/settings.types";
import { Tables } from "@/types/db.types";
import DeleteActionIcon from "@/components/UI/ActionIcons/DeleteActionIcon";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import DeleteButton from "@/components/UI/Buttons/DeleteButton";
import ProjectForm from "../Project/ProjectForm";
import { TimerRoundingSettings } from "@/types/timeTracker.types";
import { notifications } from "@mantine/notifications";
import FinanceCategoryForm from "@/components/Finances/Form/FinanceCategoryForm";

interface TimerSessionModalProps {
  timerSession: Tables<"timer_session">;
  project: Tables<"timer_project">;
  opened: boolean;
  onClose: () => void;
}

export default function EditSessionDrawer({
  timerSession,
  opened,
  onClose,
  project,
}: TimerSessionModalProps) {
  const { locale, timerRoundingSettings } = useSettingsStore();
  const { updateTimerSession, deleteTimerSessions, addProject } =
    useWorkStore();
  const [submitting, setSubmitting] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [currentProject, setCurrentProject] =
    useState<Tables<"timer_project">>(project);

  const drawerStack = useDrawersStack([
    "edit-session",
    "delete-session",
    "add-project",
    "category-form",
  ]);

  // Sync external opened state with internal drawer stack
  useEffect(() => {
    if (opened) {
      drawerStack.open("edit-session");
    } else {
      drawerStack.closeAll();
    }
  }, [opened]);

  function handleClose() {
    drawerStack.closeAll();
    onClose();
  }

  async function handleSubmit(values: {
    project_id?: string;
    start_time: string;
    end_time: string;
    active_seconds: number;
    currency: Currency;
    salary: number;
    memo?: string;
  }) {
    setSubmitting(true);

    const newSession: Tables<"timer_session"> = {
      ...timerSession,
      ...values,
      start_time: new Date(values.start_time).toISOString(),
      end_time: new Date(values.end_time).toISOString(),
      true_end_time: new Date(values.end_time).toISOString(),
      paused_seconds: 0,
      memo: values.memo || null,
    };

    const roundingSettings: TimerRoundingSettings = {
      roundInTimeFragments:
        currentProject.round_in_time_fragments !== null
          ? currentProject.round_in_time_fragments
          : timerRoundingSettings.roundInTimeFragments,
      timeFragmentInterval:
        currentProject.time_fragment_interval ??
        timerRoundingSettings.timeFragmentInterval,
      roundingInterval:
        currentProject.rounding_interval ??
        timerRoundingSettings.roundingInterval,
      roundingDirection:
        currentProject.rounding_direction ??
        timerRoundingSettings.roundingDirection,
    };

    const { success, overlapDetected } = await updateTimerSession(
      timerSession,
      newSession,
      roundingSettings
    );
    if (success) {
      handleClose();
    }
    if (overlapDetected) {
      notifications.show({
        title:
          locale === "de-DE" ? "Überschneidung erkannt" : "Overlap detected",
        message:
          locale === "de-DE"
            ? "Die Sitzung hat Überschneidungen und wurde nicht gespeichert."
            : "The session has overlaps and was not saved.",
        color: "red",
        autoClose: false,
        withBorder: true,
        icon: <IconAlertCircle />,
      });
    }
    setSubmitting(false);
  }
  async function handleDelete() {
    const success = await deleteTimerSessions([timerSession.id]);
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
          size="lg"
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
                currency: timerSession.currency,
                salary: timerSession.salary,
                memo: timerSession.memo || undefined,
              }}
              onSubmit={handleSubmit}
              onCancel={handleClose}
              onOpenProjectForm={() => drawerStack.open("add-project")}
              onProjectChange={setCurrentProject}
              newSession={false}
              project={currentProject}
              submitting={submitting}
            />
          </Flex>
        </Drawer>
        <Drawer
          {...drawerStack.register("add-project")}
          onClose={() => drawerStack.close("add-project")}
          title={
            <Group>
              <Text>
                {locale === "de-DE" ? "Projekt hinzufügen" : "Add Project"}
              </Text>
            </Group>
          }
          size="lg"
        >
          <ProjectForm
            onCancel={() => drawerStack.close("add-project")}
            categoryId={categoryId}
            setCategoryId={setCategoryId}
            onSuccess={(project) => setCurrentProject(project)}
            onOpenCategoryForm={() => drawerStack.open("category-form")}
          />
        </Drawer>
        <Drawer
          {...drawerStack.register("category-form")}
          onClose={() => drawerStack.close("category-form")}
          title={locale === "de-DE" ? "Kategorie hinzufügen" : "Add Category"}
        >
          <FinanceCategoryForm
            onClose={() => drawerStack.close("category-form")}
            onSuccess={(category) => setCategoryId(category.id)}
          />
        </Drawer>
        <Drawer
          {...drawerStack.register("delete-session")}
          onClose={() => drawerStack.close("delete-session")}
          title={
            <Group>
              <IconExclamationMark size={25} color="red" />
              <Text>
                {locale === "de-DE" ? "Sitzung löschen" : "Delete Session"}
              </Text>
            </Group>
          }
          size="md"
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
