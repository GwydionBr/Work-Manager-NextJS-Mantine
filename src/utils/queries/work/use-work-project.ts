"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useSettingsStore } from "@/stores/settingsStore";
import { useWorkStore } from "@/stores/workManagerStore";

import { getAllWorkProjects } from "@/actions/work/workProject/get-all-work-projects";
import { updateWorkProject } from "@/actions/work/workProject/update-work-project";
import { deleteWorkProjects } from "@/actions/work/workProject/delete-work-projects";
import { createWorkProject } from "@/actions/work/workProject/create-work-project";
import { getWorkProjectById } from "@/actions/work/workProject/get-work-project-by-id";
import {
  showActionErrorNotification,
  showActionSuccessNotification,
} from "@/utils/notificationFunctions";

import { WorkProject } from "@/types/work.types";
import { Tables } from "@/types/db.types";
import { MutationOptions } from "@/types/query.types";

export const useWorkProjectQuery = () => {
  return useQuery({
    queryKey: ["workProjects"],
    queryFn: getAllWorkProjects,
  });
};

export const useWorkProjectByIdQuery = ({
  projectId,
}: {
  projectId: string;
}) => {
  return useQuery({
    queryKey: ["workProjectById", projectId],
    queryFn: () => getWorkProjectById({ projectId }),
  });
};

export const useUpdateWorkProjectMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (project: Tables<"timer_project">) => void;
  onError?: () => void;
}) => {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["updateWorkProject"],
    mutationFn: updateWorkProject,
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(["workProjects"], (old: WorkProject[]) =>
        old.map((p) => (p.id === data.id ? data : p))
      );
      showActionSuccessNotification(
        getLocalizedText(
          "Projekt erfolgreich aktualisiert",
          "Project successfully updated"
        ),
        locale
      );
      const { categories, ...project } = data;
      onSuccess?.(project);
    },
    onError: (error, variables, onMutateResult, context) => {
      showActionErrorNotification(
        getLocalizedText(
          "Projekt konnten nicht aktualisiert werden",
          "Project could not be updated"
        ),
        locale
      );
      onError?.();
    },
  });
};

export const useDeleteWorkProjectMutation = ({
  onSuccess,
  onError,
}: MutationOptions) => {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["deleteWorkProject"],
    mutationFn: deleteWorkProjects,
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(["workProjects"], (old: WorkProject[]) =>
        old.filter((p) => !variables.projectIds.includes(p.id))
      );
      showActionSuccessNotification(
        getLocalizedText(
          "Projekt erfolgreich gelöscht",
          "Project successfully deleted"
        ),
        locale
      );
      onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      showActionErrorNotification(
        getLocalizedText(
          "Projekt konnten nicht gelöscht werden",
          "Project could not be deleted"
        ),
        locale
      );
      onError?.();
    },
  });
};

export const useCreateWorkProjectMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (project: Tables<"timer_project">) => void;
  onError?: () => void;
}) => {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["createWorkProject"],
    mutationFn: createWorkProject,
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(["workProjects"], (old: WorkProject[]) => [
        data,
        ...old,
      ]);
      showActionSuccessNotification(
        getLocalizedText(
          "Projekt erfolgreich erstellt",
          "Project successfully created"
        ),
        locale
      );
      const { categories, ...project } = data;
      onSuccess?.(project);
    },
    onError: (error, variables, onMutateResult, context) => {
      showActionErrorNotification(
        getLocalizedText(
          "Projekt konnten nicht erstellt werden",
          "Project could not be created"
        ),
        locale
      );
      onError?.();
    },
  });
};
