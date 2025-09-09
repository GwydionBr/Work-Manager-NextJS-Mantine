"use client";

import { useState } from "react";
import useSettingsStore from "@/stores/settingsStore";
import { useWorkStore } from "@/stores/workManagerStore";

import { Box, Button, Group, Modal, Text, useModalsStack } from "@mantine/core";
import SessionForm from "./SessionForm";
import { TablesInsert } from "@/types/db.types";
import { Currency } from "@/types/settings.types";
import { getTimeFragmentSession } from "@/utils/helper/getTimeFragmentSession";
import SessionNotification from "./SessionNotification";
import ProjectForm from "../Project/ProjectForm";
import { IconClockPlus } from "@tabler/icons-react";

interface SessionFormModalProps {
  button: React.ReactNode;
}

export default function SessionFormModal({ button }: SessionFormModalProps) {
  const stack = useModalsStack(["session-form", "project-form"]);
  const { locale, roundInTimeFragments, timeFragmentInterval } =
    useSettingsStore();
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const { activeProjectId, addTimerSession, addProject } = useWorkStore();
  const activeProject = useWorkStore((state) =>
    state.projects.find((p) => p.project.id === activeProjectId)
  );
  const [submittingSession, setSubmittingSession] = useState(false);
  const [submittingProject, setSubmittingProject] = useState(false);

  async function handleSessionSubmit(values: {
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
    setSubmittingSession(true);

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
      await addTimerSession(
        newSession,
        roundInTimeFragments,
        timeFragmentInterval
      );

    SessionNotification({
      originalSession: newSession,
      completeOverlap,
      createdSessions,
      overlappingSessions,
      locale,
      onCreatedSessions: () => {
        stack.closeAll();
      },
    });

    setSubmittingSession(false);
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
    const { createdProject } = await addProject({
      ...values,
    });
    if (createdProject) {
      setCurrentProjectId(createdProject.id);
      stack.close("project-form");
    }
    setSubmittingProject(false);
  }
  return (
    <Box>
      <Modal.Stack>
        <Modal
          {...stack.register("session-form")}
          title={
            <Group>
              <IconClockPlus />
              <Text>
                {locale === "de-DE" ? "Sitzung hinzufügen" : "Add Session"}
              </Text>
            </Group>
          }
          transitionProps={{ transition: "fade-right", duration: 400 }}
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
            onSubmit={handleSessionSubmit}
            projectId={currentProjectId ?? undefined}
            onProjectChange={setCurrentProjectId}
            onOpenProjectForm={() => stack.open("project-form")}
            onCancel={stack.closeAll}
            newSession
            project={activeProject?.project}
            submitting={submittingSession}
          />
        </Modal>

        <Modal
          {...stack.register("project-form")}
          title="Add project"
          transitionProps={{ transition: "fade-right", duration: 400 }}
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
            }}
            onSubmit={handleProjectSubmit}
            onCancel={() => stack.close("project-form")}
            newProject
            submitting={submittingProject}
          />
        </Modal>
      </Modal.Stack>

      <Box onClick={() => stack.open("session-form")}>{button}</Box>
    </Box>
  );
}
