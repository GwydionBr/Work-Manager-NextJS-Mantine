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
import { IconAlertTriangleFilled, IconCategoryPlus } from "@tabler/icons-react";
import FinanceCategoryForm from "@/components/Finances/FinanceCategory/FinanceCategoryForm";
import {
  showActionErrorNotification,
  showActionSuccessNotification,
} from "@/utils/notificationFunctions";

interface EditProjectDrawerProps {
  opened: boolean;
  onClose: () => void;
}

export default function EditProjectDrawer({
  opened,
  onClose,
}: EditProjectDrawerProps) {
  const { locale } = useSettingsStore();
  const { activeProjectId, deleteProject } = useWorkStore();
  const activeProject = useWorkStore((state) =>
    state.projects.find((p) => p.id === activeProjectId)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const drawersStack = useDrawersStack([
    "edit-project",
    "delete-project",
    "category-form",
  ]);

  useEffect(() => {
    if (activeProject) {
      setCategoryIds(activeProject.categoryIds);
    }
  }, [activeProject]);

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

  async function handleDelete() {
    setIsLoading(true);
    if (activeProject) {
      const success = await deleteProject(activeProject.id);
      if (success) {
        handleClose();
        showActionSuccessNotification(
          locale === "de-DE"
            ? "Projekt erfolgreich gelöscht"
            : "Project deleted successfully",
          locale
        );
      } else {
        showActionErrorNotification(
          locale === "de-DE"
            ? "Projekt konnte nicht gelöscht werden"
            : "Project could not be deleted",
          locale
        );
      }
    }
    setIsLoading(false);
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
          size="lg"
          padding="md"
        >
          <Stack justify="flex-start" gap="xl">
            <ProjectForm
              project={activeProject}
              onCancel={handleClose}
              onClose={handleClose}
              categoryIds={categoryIds}
              setCategoryIds={setCategoryIds}
              onOpenCategoryForm={() => drawersStack.open("category-form")}
            />
          </Stack>
        </Drawer>
        <Drawer
          size="md"
          {...drawersStack.register("delete-project")}
          onClose={() => drawersStack.close("delete-project")}
          title={
            <Group>
              <IconAlertTriangleFilled size={25} color="red" />
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
              onClick={() => drawersStack.close("delete-project")}
              color="teal"
              tooltipLabel={locale === "de-DE" ? "Abbrechen" : "Cancel"}
            />
            <DeleteButton
              onClick={handleDelete}
              color="red"
              tooltipLabel={
                locale === "de-DE" ? "Projekt löschen" : "Delete Project"
              }
              loading={isLoading}
            />
          </Group>
        </Drawer>
        <Drawer
          size="md"
          {...drawersStack.register("category-form")}
          onClose={() => drawersStack.close("category-form")}
          title={
            <Group>
              <IconCategoryPlus />
              <Text>
                {locale === "de-DE" ? "Kategorie hinzufügen" : "Add Category"}
              </Text>
            </Group>
          }
        >
          <FinanceCategoryForm
            onClose={() => drawersStack.close("category-form")}
            onSuccess={(category) => setCategoryIds([...categoryIds, category.id])}
          />
        </Drawer>
      </Drawer.Stack>
    </Box>
  );
}
