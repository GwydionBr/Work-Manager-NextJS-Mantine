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
import ProjectForm from "../Project/ProjectForm";

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
  const { locale } = useSettingsStore();
  const { updateTimerSession, deleteTimerSessions, addProject } =
    useWorkStore();
  const [submitting, setSubmitting] = useState(false);
  const [submittingProject, setSubmittingProject] = useState(false);
  const [currentProject, setCurrentProject] =
    useState<Tables<"timer_project">>(project);

  const drawerStack = useDrawersStack([
    "edit-session",
    "delete-session",
    "add-project",
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

    const success = await updateTimerSession(newSession);
    if (success) {
      handleClose();
    }
    setSubmitting(false);
  }
  async function handleDelete() {
    const success = await deleteTimerSessions([timerSession.id]);
    if (success) {
      handleClose();
    }
  }

  async function handleProjectSubmit(values: {
    color: string | null;
    title: string;
    description: string;
    salary: number;
    currency: Currency;
    payment_per_project: boolean;
    cash_flow_category_id?: string | null;
  }) {
    setSubmittingProject(true);
    const { createdProject } = await addProject(
      {
        ...values,
      },
      false
    );
    if (createdProject) {
      setCurrentProject(createdProject);
      drawerStack.close("add-project");
    }
    setSubmittingProject(false);
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
        >
          <ProjectForm
            initialValues={{
              color: null,
              title: "",
              description: "",
              salary: 0,
              currency: "USD",
              hourly_payment: false,
              cash_flow_category_id: null,
              rounding_interval: null,
              rounding_direction: null,
              round_in_time_fragments: null,
              time_fragment_interval: null,
            }}
            onSubmit={handleProjectSubmit}
            onCancel={() => drawerStack.close("add-project")}
            newProject
            submitting={submittingProject}
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
