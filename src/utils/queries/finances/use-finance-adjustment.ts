"use client";

import { useMutation } from "@tanstack/react-query";
import { useSettingsStore } from "@/stores/settingsStore";

import { updateFinanceAdjustment } from "@/actions/finance/financeAdjustment/update-finance-adjustment";
import { deleteFinanceAdjustments } from "@/actions/finance/financeAdjustment/delete-finance-adjustments";
import { createFinanceAdjustment } from "@/actions/finance/financeAdjustment/create-finance-adjustment";
import {
  showActionErrorNotification,
  showActionSuccessNotification,
} from "@/utils/notificationFunctions";

import { Tables, TablesInsert, TablesUpdate } from "@/types/db.types";
import { FinanceProject } from "@/types/finance.types";

// Mutation to create a finance adjustment
export function useCreateFinanceAdjustmentMutation(
  onSuccess?: () => void,
  onError?: () => void
) {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["createFinanceAdjustment"],
    mutationFn: (adjustment: TablesInsert<"finance_project_adjustment">) =>
      createFinanceAdjustment(adjustment),
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(
        ["financeProjects"],
        (old: FinanceProject[]) =>
          old.map((p) =>
            p.id === data.finance_project_id
              ? { ...p, adjustments: [...p.adjustments, data] }
              : p
          )
      );
      context.client.invalidateQueries({ queryKey: ["financeProjects"] });
      showActionSuccessNotification(
        getLocalizedText(
          "Finanzanpassung erfolgreich erstellt",
          "Finance adjustment successfully created"
        ),
        locale
      );
      onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      showActionErrorNotification(
        getLocalizedText(
          "Finanzanpassung konnten nicht erstellt werden",
          "Finance adjustment could not be created"
        ),
        locale
      );
      onError?.();
    },
  });
}

// Mutation to update a finance adjustment
export function useUpdateFinanceAdjustmentMutation(
  onSuccess?: () => void,
  onError?: () => void
) {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["updateFinanceAdjustment"],
    mutationFn: (adjustment: TablesUpdate<"finance_project_adjustment">) =>
      updateFinanceAdjustment(adjustment),
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(
        ["financeProjects"],
        (old: FinanceProject[]) =>
          old.map((p) =>
            p.id === data.finance_project_id
              ? {
                  ...p,
                  adjustments: p.adjustments.map((a) =>
                    a.id === data.id ? data : a
                  ),
                }
              : p
          )
      );
      context.client.invalidateQueries({ queryKey: ["financeProjects"] });
      showActionSuccessNotification(
        getLocalizedText(
          "Finanzanpassung erfolgreich aktualisiert",
          "Finance adjustment successfully updated"
        ),
        locale
      );
      onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      showActionErrorNotification(
        getLocalizedText(
          "Finanzanpassung konnten nicht aktualisiert werden",
          "Finance adjustment could not be updated"
        ),
        locale
      );
      onError?.();
    },
  });
}

// Mutation to delete a finance adjustment
export function useDeleteFinanceAdjustmentMutation(
  onSuccess?: () => void,
  onError?: () => void
) {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["deleteFinanceAdjustment"],
    mutationFn: (ids: string[]) => deleteFinanceAdjustments(ids),
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(
        ["financeProjects"],
        (old: FinanceProject[]) =>
          old.map((p) => ({
            ...p,
            adjustments: p.adjustments.filter((a) => !variables.includes(a.id)),
          }))
      );
      context.client.invalidateQueries({ queryKey: ["financeProjects"] });
      showActionSuccessNotification(
        getLocalizedText(
          "Finanzanpassung erfolgreich gelöscht",
          "Finance adjustment successfully deleted"
        ),
        locale
      );
      onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      showActionErrorNotification(
        getLocalizedText(
          "Finanzanpassung konnten nicht gelöscht werden",
          "Finance adjustment could not be deleted"
        ),
        locale
      );
      onError?.();
    },
  });
}
