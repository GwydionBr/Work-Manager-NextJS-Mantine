"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useSettingsStore } from "@/stores/settingsStore";

import { getAllTimerProjects } from "@/actions/work/timerProject/get-all-timer-projects";
import { updateTimerProject } from "@/actions/work/timerProject/update-timer-project";
import { deleteTimerProjects } from "@/actions/work/timerProject/delete-timer-projects";
import { createTimerProject } from "@/actions/work/timerProject/create-timer-project";
import {
  showActionErrorNotification,
  showActionSuccessNotification,
} from "@/utils/notificationFunctions";

import { TimerProject } from "@/types/work.types";
import { Tables } from "@/types/db.types";
import { MutationOptions } from "@/types/query.types";

export const useTimerProjectQuery = () => {
  return useQuery({
    queryKey: ["timerProject"],
    queryFn: getAllTimerProjects,
  });
};

export const useUpdateTimerProjectMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (project: Tables<"timer_project">) => void;
  onError?: () => void;
}) => {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["updateTimerProject"],
    mutationFn: updateTimerProject,
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(["timerProject"], (old: TimerProject[]) =>
        old.map((p) => (p.id === data.id ? data : p))
      );
      context.client.invalidateQueries({ queryKey: ["timerProject"] });
      showActionSuccessNotification(
        getLocalizedText(
          "Projekt erfolgreich aktualisiert",
          "Project successfully updated"
        ),
        locale
      );
      const { categories, sessions, ...project } = data;
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

export const useDeleteTimerProjectMutation = ({
  onSuccess,
  onError,
}: MutationOptions) => {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["deleteTimerProject"],
    mutationFn: deleteTimerProjects,
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(["timerProject"], (old: TimerProject[]) =>
        old.filter((p) => !variables.projectIds.includes(p.id))
      );
      context.client.invalidateQueries({ queryKey: ["timerProject"] });
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

export const useCreateTimerProjectMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (project: Tables<"timer_project">) => void;
  onError?: () => void;
}) => {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["createTimerProject"],
    mutationFn: createTimerProject,
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(["timerProject"], (old: TimerProject[]) => [
        data,
        ...old,
      ]);
      context.client.invalidateQueries({ queryKey: ["timerProject"] });
      showActionSuccessNotification(
        getLocalizedText(
          "Projekt erfolgreich erstellt",
          "Project successfully created"
        ),
        locale
      );
      const { categories, sessions, ...project } = data;
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
