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

import { TablesInsert, TablesUpdate } from "@/types/db.types";
import { FinanceProject } from "@/types/finance.types";
import { CustomMutationProps } from "@/types/query.types";

// Mutation to create a finance adjustment
export const useCreateFinanceAdjustmentMutation = ({
  ...props
  }: CustomMutationProps = {}) => {
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
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Finanzanpassung erfolgreich erstellt",
            "Finance adjustment successfully created"
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
            "Finanzanpassung konnten nicht erstellt werden",
            "Finance adjustment could not be created"
          ),
          locale
        );
      }
      props.onError?.();
    },
  });
};

// Mutation to update a finance adjustment
export const useUpdateFinanceAdjustmentMutation = ({
  ...props
}: CustomMutationProps = {}) => {
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
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Finanzanpassung erfolgreich aktualisiert",
            "Finance adjustment successfully updated"
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
            "Finanzanpassung konnten nicht aktualisiert werden",
            "Finance adjustment could not be updated"
          ),
          locale
        );
      }
      props.onError?.();
    },
  });
};

// Mutation to delete a finance adjustment
export const useDeleteFinanceAdjustmentMutation = ({
  ...props
}: CustomMutationProps = {}) => {
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
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Finanzanpassung erfolgreich gelöscht",
            "Finance adjustment successfully deleted"
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
            "Finanzanpassung konnten nicht gelöscht werden",
            "Finance adjustment could not be deleted"
          ),
          locale
        );
      }
      props.onError?.();
    },
  });
};
