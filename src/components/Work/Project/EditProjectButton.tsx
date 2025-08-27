"use client";

import { useState } from "react";
import { useWorkStore } from "@/stores/workManagerStore";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  Box,
  Drawer,
  Group,
  Stack,
  Text,
  Button,
  useDrawersStack,
} from "@mantine/core";
import ProjectForm from "@/components/Work/Project/ProjectForm";
import EditActionIcon from "@/components/UI/ActionIcons/EditActionIcon";
import DeleteActionIcon from "@/components/UI/ActionIcons/DeleteActionIcon";

import { Currency } from "@/types/settings.types";

export default function EditProjectButton() {
  const { locale } = useSettingsStore();
  const { activeProjectId, updateProject, deleteProject } = useWorkStore();
  const activeProject = useWorkStore((state) =>
    state.projects.find((p) => p.project.id === activeProjectId)
  );
  const [submitting, setSubmitting] = useState(false);
  const drawersStack = useDrawersStack(["edit-project", "delete-project"]);

  async function handleSubmit(values: {
    color: string | null;
    title: string;
    description: string | null;
    salary: number;
    currency: Currency;
    hourly_payment: boolean;
    cash_flow_category_id?: string | null;
  }) {
    if (!activeProject) {
      return;
    }
    setSubmitting(true);
    const success = await updateProject({
      id: activeProject.project.id,
      ...values,
    });
    if (success) {
      drawersStack.closeAll();
    }
    setSubmitting(false);
  }

  async function handleDelete() {
    if (activeProject) {
      const result = await deleteProject(activeProject.project.id);
      if (result) {
        drawersStack.closeAll();
      }
    }
  }

  if (!activeProject) {
    return null;
  }

  return (
    <Box>
      <Drawer.Stack>
        <Drawer
          {...drawersStack.register("edit-project")}
          title={
            <Group gap="xs">
              <DeleteActionIcon
                onClick={() => drawersStack.open("delete-project")}
              />
              <Text fw={600}>
                {locale === "de-DE" ? "Projekt bearbeiten" : "Edit project"}
              </Text>
            </Group>
          }
          size="md"
          padding="md"
        >
          <Stack justify="flex-start" gap="xl">
            <ProjectForm
              initialValues={{
                color: activeProject.project.color,
                title: activeProject.project.title,
                description: activeProject.project.description,
                salary: activeProject.project.salary,
                currency: activeProject.project.currency ?? "",
                hourly_payment: activeProject.project.hourly_payment,
                cash_flow_category_id:
                  activeProject.project.cash_flow_category_id,
              }}
              onSubmit={handleSubmit}
              onCancel={drawersStack.closeAll}
              newProject={false}
              submitting={submitting}
            />
          </Stack>
        </Drawer>
        <Drawer
          {...drawersStack.register("delete-project")}
          title={locale === "de-DE" ? "Projekt löschen" : "Delete Project"}
        >
          <Text>
            {locale === "de-DE"
              ? "Sind Sie sicher, dass Sie dieses Projekt löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
              : "Are you sure you want to delete this project? This action cannot be undone."}
          </Text>
          <Group mt="md" justify="flex-end" gap="sm">
            <Button onClick={drawersStack.closeAll} variant="outline">
              {locale === "de-DE" ? "Abbrechen" : "Cancel"}
            </Button>
            <Button onClick={handleDelete} color="red">
              {locale === "de-DE" ? "Löschen" : "Delete"}
            </Button>
          </Group>
        </Drawer>
      </Drawer.Stack>

      <EditActionIcon
        aria-label={locale === "de-DE" ? "Projekt bearbeiten" : "Edit project"}
        onClick={() => drawersStack.open("edit-project")}
        size="md"
        tooltipLabel={
          locale === "de-DE" ? "Projekt bearbeiten" : "Edit project"
        }
      />
    </Box>
  );
}
