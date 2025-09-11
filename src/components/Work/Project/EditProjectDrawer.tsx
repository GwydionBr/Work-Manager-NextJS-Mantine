"use client";

import { useEffect, useState } from "react";
import { useWorkStore } from "@/stores/workManagerStore";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  Box,
  Drawer,
  Group,
  Stack,
  Text,
  useDrawersStack,
} from "@mantine/core";
import ProjectForm from "@/components/Work/Project/ProjectForm";
import DeleteActionIcon from "@/components/UI/ActionIcons/DeleteActionIcon";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import DeleteButton from "@/components/UI/Buttons/DeleteButton";
import { IconExclamationMark } from "@tabler/icons-react";

import { Currency } from "@/types/settings.types";

interface EditProjectDrawerProps {
  opened: boolean;
  onClose: () => void;
}

export default function EditProjectDrawer({
  opened,
  onClose,
}: EditProjectDrawerProps) {
  const { locale } = useSettingsStore();
  const { activeProjectId, updateProject, deleteProject } = useWorkStore();
  const activeProject = useWorkStore((state) =>
    state.projects.find((p) => p.project.id === activeProjectId)
  );
  const [submitting, setSubmitting] = useState(false);
  const drawersStack = useDrawersStack(["edit-project", "delete-project"]);

  useEffect(() => {
    if (opened) {
      drawersStack.open("edit-project");
    } else {
      drawersStack.closeAll();
    }
  }, [opened]);

  function handleClose() {
    drawersStack.closeAll();
    onClose();
  }

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
      handleClose();
    }
    setSubmitting(false);
  }

  async function handleDelete() {
    if (activeProject) {
      const result = await deleteProject(activeProject.project.id);
      if (result) {
        handleClose();
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
          onClose={handleClose}
          title={
            <Group gap="xs">
              <DeleteActionIcon
                tooltipLabel={
                  locale === "de-DE" ? "Projekt löschen" : "Delete Project"
                }
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
                rounding_interval: activeProject.project.rounding_interval,
                rounding_direction: activeProject.project.rounding_direction,
                round_in_time_fragments:
                  activeProject.project.round_in_time_fragments,
                time_fragment_interval:
                  activeProject.project.time_fragment_interval,
              }}
              onSubmit={handleSubmit}
              onCancel={handleClose}
              newProject={false}
              submitting={submitting}
            />
          </Stack>
        </Drawer>
        <Drawer
          {...drawersStack.register("delete-project")}
          onClose={handleClose}
          title={
            <Group>
              <IconExclamationMark size={25} color="red" />
              <Text>
                {locale === "de-DE" ? "Projekt löschen" : "Delete Project"}
              </Text>
            </Group>
          }
        >
          <Text>
            {locale === "de-DE"
              ? "Sind Sie sicher, dass Sie dieses Projekt löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
              : "Are you sure you want to delete this project? This action cannot be undone."}
          </Text>
          <Group mt="md" justify="flex-end" gap="sm">
            <CancelButton
              onClick={handleClose}
              color="teal"
              tooltipLabel={locale === "de-DE" ? "Abbrechen" : "Cancel"}
            />
            <DeleteButton
              onClick={handleDelete}
              color="red"
              tooltipLabel={
                locale === "de-DE" ? "Projekt löschen" : "Delete Project"
              }
            />
          </Group>
        </Drawer>
      </Drawer.Stack>
    </Box>
  );
}
