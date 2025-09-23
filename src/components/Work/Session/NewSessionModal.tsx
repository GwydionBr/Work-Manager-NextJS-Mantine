"use client";

import { useState, useEffect } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useWorkStore } from "@/stores/workManagerStore";

import { Group, Modal, Text, useModalsStack } from "@mantine/core";
import SessionForm from "./SessionForm";
import { Tables, TablesInsert } from "@/types/db.types";
import { Currency } from "@/types/settings.types";
import SessionNotification from "./SessionNotification";
import ProjectForm from "../Project/ProjectForm";
import { IconClockPlus } from "@tabler/icons-react";
import { NewSession } from "@/types/timerSession.types";
import { TimerRoundingSettings } from "@/types/timeTracker.types";
import FinanceCategoryForm from "@/components/Finances/FInanceCategory/FinanceCategoryForm";

interface NewSessionModalProps {
  opened: boolean;
  onClose: () => void;
  initialValues?: NewSession;
  project?: Tables<"timer_project">;
}

export default function NewSessionModal({
  opened,
  onClose,
  initialValues,
  project,
}: NewSessionModalProps) {
  const stack = useModalsStack([
    "session-form",
    "project-form",
    "category-form",
  ]);
  const {
    locale,
    timerRoundingSettings,
    format24h,
    defaultSalaryAmount,
    defaultSalaryCurrency,
  } = useSettingsStore();
  const [currentProject, setCurrentProject] = useState<
    Tables<"timer_project"> | undefined
  >(project);
  const { addTimerSession } = useWorkStore();
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [submittingSession, setSubmittingSession] = useState(false);

  useEffect(() => {
    setCurrentProject(project);
  }, [project]);

  useEffect(() => {
    if (opened) {
      stack.open("session-form");
    } else {
      stack.closeAll();
    }
  }, [opened]);

  async function handleSessionSubmit(values: {
    start_time: string;
    end_time: string;
    active_seconds: number;
    currency: Currency;
    salary: number;
    memo?: string;
  }) {
    if (!currentProject) {
      return;
    }
    setSubmittingSession(true);

    let newSession: TablesInsert<"timer_session"> = {
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

    const { createdSessions, overlappingSessions, completeOverlap } =
      await addTimerSession(newSession, roundingSettings);

    SessionNotification({
      originalSession: newSession,
      completeOverlap,
      createdSessions,
      overlappingSessions,
      locale,
      format24h,
      onCreatedSessions: () => {
        onClose();
      },
    });

    setSubmittingSession(false);
  }

  return (
    <Modal.Stack>
      <Modal
        size="lg"
        {...stack.register("session-form")}
        onClose={onClose}
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
          initialValues={
            initialValues ?? {
              project_id: undefined,
              start_time: new Date(new Date().setSeconds(0, 0)).toISOString(),
              end_time: new Date(new Date().setSeconds(0, 0)).toISOString(),
              active_seconds: 0,
              paused_seconds: 0,
              currency: project?.currency ?? defaultSalaryCurrency,
              salary: project?.salary ?? defaultSalaryAmount,
            }
          }
          newSession={true}
          onSubmit={handleSessionSubmit}
          onProjectChange={setCurrentProject}
          onOpenProjectForm={() => stack.open("project-form")}
          onCancel={onClose}
          submitting={submittingSession}
          project={currentProject}
        />
      </Modal>

      <Modal
        size="lg"
        {...stack.register("project-form")}
        title={locale === "de-DE" ? "Projekt hinzufügen" : "Add Project"}
        transitionProps={{ transition: "fade-right", duration: 400 }}
      >
        <ProjectForm
          onCancel={() => stack.close("project-form")}
          onClose={() => stack.close("project-form")}
          categoryId={categoryId}
          setCategoryId={setCategoryId}
          onOpenCategoryForm={() => stack.open("category-form")}
          onSuccess={(project) => setCurrentProject(project)}
        />
      </Modal>
      <Modal
        size="lg"
        {...stack.register("category-form")}
        onClose={() => stack.close("category-form")}
        title={locale === "de-DE" ? "Kategorie hinzufügen" : "Add Category"}
      >
        <FinanceCategoryForm
          onClose={() => stack.close("category-form")}
          onSuccess={(category) => setCategoryId(category.id)}
        />
      </Modal>
    </Modal.Stack>
  );
}
