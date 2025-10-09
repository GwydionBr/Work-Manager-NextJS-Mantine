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
import { payoutFinanceProject } from "@/actions/finance/payout/payout-finance-project";
import { Tables } from "@/types/db.types";

// Query to get all finance projects
export function useFinanceProjectQuery() {
  return useQuery({
    queryKey: ["financeProjects"],
    queryFn: () => getAllFinanceProjects(),
  });
}
// Mutation to update a finance project
export function useUpdateFinanceProjectMutation(
  onSuccess?: () => void,
  onError?: () => void
) {
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
      context.client.invalidateQueries({ queryKey: ["financeProjects"] });
      showActionSuccessNotification(
        getLocalizedText(
          "Finanzprojekt erfolgreich aktualisiert",
          "Finance project successfully updated"
        ),
        locale
      );
      onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      showActionErrorNotification(
        getLocalizedText(
          "Finanzprojekt konnten nicht aktualisiert werden",
          "Finance project could not be updated"
        ),
        locale
      );
      onError?.();
    },
  });
}

// Mutation to delete a finance project
export function useDeleteFinanceProjectMutation(
  onSuccess?: () => void,
  onError?: () => void
) {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["deleteFinanceProject"],
    mutationFn: (ids: string[]) => deleteFinanceProjects(ids),
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(
        ["financeProjects"],
        (old: FinanceProject[]) => old.filter((p) => !variables.includes(p.id))
      );
      context.client.invalidateQueries({ queryKey: ["financeProjects"] });
      showActionSuccessNotification(
        getLocalizedText(
          "Finanzprojekt erfolgreich gelöscht",
          "Finance project successfully deleted"
        ),
        locale
      );
      onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      showActionErrorNotification(
        getLocalizedText(
          "Finanzprojekt konnten nicht gelöscht werden",
          "Finance project could not be deleted"
        ),
        locale
      );
      onError?.();
    },
  });
}

// Mutation to create a finance project
export function useCreateFinanceProjectMutation(
  onSuccess?: () => void,
  onError?: () => void
) {
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
      context.client.invalidateQueries({ queryKey: ["financeProjects"] });
      showActionSuccessNotification(
        getLocalizedText(
          "Finanzprojekt erfolgreich erstellt",
          "Finance project successfully created"
        ),
        locale
      );
      onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      showActionErrorNotification(
        getLocalizedText(
          "Finanzprojekt konnten nicht erstellt werden",
          "Finance project could not be created"
        ),
        locale
      );
      onError?.();
    },
  });
}
