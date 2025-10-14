"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useSettingsStore } from "@/stores/settingsStore";

import { getAllFinanceProjects } from "@/actions/finance/financeProject/get-all-finance-projects";
import { updateFinanceProject } from "@/actions/finance/financeProject/update-finance-project";
import { deleteFinanceProjects } from "@/actions/finance/financeProject/delete-finance-projects";
import { createFinanceProject } from "@/actions/finance/financeProject/create-finance-project";
import {
  showActionErrorNotification,
  showActionSuccessNotification,
} from "@/utils/notificationFunctions";

import {
  FinanceProject,
  InsertFinanceProject,
  UpdateFinanceProject,
} from "@/types/finance.types";
import { CustomMutationProps } from "@/types/query.types";

// Query to get all finance projects
export function useFinanceProjectQuery() {
  return useQuery({
    queryKey: ["financeProjects"],
    queryFn: () => getAllFinanceProjects(),
  });
}
// Mutation to update a finance project
export const useUpdateFinanceProjectMutation = ({
  ...props
}: CustomMutationProps) => {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["updateFinanceProject"],
    mutationFn: (financeProject: UpdateFinanceProject) =>
      updateFinanceProject(financeProject),
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(
        ["financeProjects"],
        (old: FinanceProject[]) => old.map((p) => (p.id === data.id ? data : p))
      );
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Finanzprojekt erfolgreich aktualisiert",
            "Finance project successfully updated"
          ),
          locale
        );
      }
      props.onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      if (props.showNotification !== false) {
        showActionErrorNotification(
          getLocalizedText(
            "Finanzprojekt konnten nicht aktualisiert werden",
            "Finance project could not be updated"
          ),
          locale
        );
      }
      props.onError?.();
    },
  });
};

// Mutation to delete a finance project
export const useDeleteFinanceProjectMutation = ({
  ...props
}: CustomMutationProps) => {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["deleteFinanceProject"],
    mutationFn: (ids: string[]) => deleteFinanceProjects(ids),
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(
        ["financeProjects"],
        (old: FinanceProject[]) => old.filter((p) => !variables.includes(p.id))
      );
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Finanzprojekt erfolgreich gelöscht",
            "Finance project successfully deleted"
          ),
          locale
        );
      }
      props.onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      if (props.showNotification !== false) {
        showActionErrorNotification(
          getLocalizedText(
            "Finanzprojekt konnten nicht gelöscht werden",
            "Finance project could not be deleted"
          ),
          locale
        );
      }
      props.onError?.();
    },
  });
};

// Mutation to create a finance project
export const useCreateFinanceProjectMutation = ({
  ...props
}: CustomMutationProps) => {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["createFinanceProject"],
    mutationFn: (financeProject: InsertFinanceProject) =>
      createFinanceProject({ project: financeProject }),
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(
        ["financeProjects"],
        (old: FinanceProject[]) => [data, ...old]
      );
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Finanzprojekt erfolgreich erstellt",
            "Finance project successfully created"
          ),
          locale
        );
      }
      props.onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      if (props.showNotification !== false) {
        showActionErrorNotification(
          getLocalizedText(
            "Finanzprojekt konnten nicht erstellt werden",
            "Finance project could not be created"
          ),
          locale
        );
      }
      props.onError?.();
    },
  });
};
