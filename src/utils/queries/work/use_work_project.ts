"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useSettingsStore } from "@/stores/settingsStore";

import { getAllWorkProjects } from "@/actions/work/timerProject/get-all-work-projects";
import { updateWorkProject } from "@/actions/work/timerProject/update-work-project";
import { deleteWorkProjects } from "@/actions/work/timerProject/delete-work-projects";
import { createWorkProject } from "@/actions/work/timerProject/create-work-project";
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
      context.client.invalidateQueries({ queryKey: ["workProjects"] });
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
      context.client.invalidateQueries({ queryKey: ["workProjects"] });
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
      context.client.invalidateQueries({ queryKey: ["workProjects"] });
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
