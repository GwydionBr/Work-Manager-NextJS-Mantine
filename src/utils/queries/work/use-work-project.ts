"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useFormatter } from "@/hooks/useFormatter";

import { getAllWorkProjects } from "@/actions/work/workProject/get-all-work-projects";
import { updateWorkProject } from "@/actions/work/workProject/update-work-project";
import { deleteWorkProjects } from "@/actions/work/workProject/delete-work-projects";
import { createWorkProject } from "@/actions/work/workProject/create-work-project";
import { getWorkProjectById } from "@/actions/work/workProject/get-work-project-by-id";
import {
  showActionErrorNotification,
  showActionSuccessNotification,
} from "@/utils/notificationFunctions";

import { CompleteWorkProject, WorkProject } from "@/types/work.types";
import { Tables } from "@/types/db.types";
import { CustomMutationProps } from "@/types/query.types";

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
  ...props
}: CustomMutationProps<Tables<"timer_project">> = {}) => {
  const { getLocalizedText } = useFormatter();
  return useMutation({
    mutationKey: ["updateWorkProject"],
    onMutate: async (newProject, context) => {
      // Cancel the query to avoid race conditions
      await context.client.cancelQueries({ queryKey: ["workProjects"] });
      // Get the previous data
      const previousProjects: WorkProject[] | undefined =
        context.client.getQueryData(["workProjects"]);
      // Update the data in the cache
      if (props.optimisticUpdate) {
        context.client.setQueryData(["workProjects"], (old: WorkProject[]) =>
          old.map((p) =>
            p.id === newProject.project.id ? { ...p, ...newProject.project } : p
          )
        );
      }
      // Return the previous data
      return { previousProjects };
    },
    mutationFn: updateWorkProject,
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(["workProjects"], (old: WorkProject[]) =>
        old.map((p) => (p.id === data.id ? data : p))
      );
      context.client.setQueryData(
        ["workProjectById", variables.project.id],
        (old: WorkProject) => (old ? { ...old, ...data } : old)
      );
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Projekt erfolgreich aktualisiert",
            "Project successfully updated"
          )
        );
      }
      const { categories, ...project } = data;
      props.onSuccess?.(project);
    },
    onError: (error, variables, onMutateResult, context) => {
      // Rollback the data
      context.client.setQueryData(
        ["workProjects"],
        onMutateResult?.previousProjects ?? []
      );
      if (props.showNotification !== false) {
        showActionErrorNotification(
          getLocalizedText(
            "Projekt konnten nicht aktualisiert werden",
            "Project could not be updated"
          )
        );
      }
      props.onError?.();
    },
  });
};

export const useDeleteWorkProjectMutation = ({
  ...props
}: CustomMutationProps = {}) => {
  const { getLocalizedText } = useFormatter();
  return useMutation({
    mutationKey: ["deleteWorkProject"],
    mutationFn: deleteWorkProjects,
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(["workProjects"], (old: WorkProject[]) =>
        old.filter((p) => !variables.projectIds.includes(p.id))
      );
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Projekt erfolgreich gelöscht",
            "Project successfully deleted"
          )
        );
      }
      props.onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      if (props.showNotification !== false) {
        showActionErrorNotification(
          getLocalizedText(
            "Projekt konnten nicht gelöscht werden",
            "Project could not be deleted"
          )
        );
      }
      props.onError?.();
    },
  });
};

export const useCreateWorkProjectMutation = ({
  ...props
}: CustomMutationProps<Tables<"timer_project">> = {}) => {
  const { getLocalizedText } = useFormatter();
  return useMutation({
    mutationKey: ["createWorkProject"],
    mutationFn: createWorkProject,
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(["workProjects"], (old: WorkProject[]) => [
        data,
        ...old,
      ]);
      context.client.setQueryData(["workProjectById", data.id], () => ({
        ...data,
        timeEntries: [],
      }));
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Projekt erfolgreich erstellt",
            "Project successfully created"
          )
        );
      }
      const { categories, ...project } = data;
      props.onSuccess?.(project);
    },
    onError: (error, variables, onMutateResult, context) => {
      if (props.showNotification !== false) {
        showActionErrorNotification(
          getLocalizedText(
            "Projekt konnten nicht erstellt werden",
            "Project could not be created"
          )
        );
      }
      props.onError?.();
    },
  });
};
