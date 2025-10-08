"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { getAllRecurringCashFlows } from "@/actions/finance/recurringCashflow/get-all-recurring-cashflows";
import { addRecurringCashFlow } from "@/actions/finance/recurringCashflow/add-recurring-cashflow";
import {
  DeleteRecurringCashFlowMode,
  RecurringCashFlow,
  SingleCashFlow,
} from "@/types/finance.types";
import { TablesInsert } from "@/types/db.types";
import { useSettingsStore } from "@/stores/settingsStore";
import {
  showActionErrorNotification,
  showActionSuccessNotification,
} from "@/utils/notificationFunctions";
import { deleteRecurringCashflow } from "@/actions/finance/recurringCashflow/delete-recurring-cashflow";

export function useRecurringCashflowQuery() {
  return useQuery({
    queryKey: ["recurringCashFlows"],
    queryFn: () => getAllRecurringCashFlows(),
  });
}

export function useAddRecurringCashflowMutation(
  onSuccess?: () => void,
  onError?: () => void
) {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["addRecurringCashFlow"],
    mutationFn: ({
      cashflow,
      categoryIds,
    }: {
      cashflow: TablesInsert<"recurring_cash_flow">;
      categoryIds: string[];
    }) => addRecurringCashFlow({ cashflow, categoryIds }),
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(
        ["recurringCashFlows"],
        (old: RecurringCashFlow[]) => [data, ...old]
      );
      showActionSuccessNotification(
        getLocalizedText(
          "Wiederkehrender Cashflow erfolgreich hinzugefügt",
          "Recurring cash flow added successfully"
        ),
        locale
      );
      onSuccess?.();
    },
    onSettled: (data, error, variables, onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: ["recurringCashFlows"],
      });
    },
    onError: (error, variables, onMutateResult, context) => {
      showActionErrorNotification(
        getLocalizedText(
          "Fehler beim Hinzufügen der wiederkehrenden Zahlung",
          "Failed to add recurring cash flow"
        ),
        locale
      );
      onError?.();
    },
  });
}

export function useDeleteRecurringCashflowMutation(
  onSuccess?: () => void,
  onError?: () => void
) {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["deleteRecurringCashFlow"],
    mutationFn: ({
      recurringCashFlowId,
      mode,
    }: {
      recurringCashFlowId: string;
      mode: DeleteRecurringCashFlowMode;
    }) => deleteRecurringCashflow({ recurringCashFlowId, mode }),
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(
        ["recurringCashFlows"],
        (old: RecurringCashFlow[]) =>
          old.filter((c) => c.id !== variables.recurringCashFlowId)
      );
      if (variables.mode === DeleteRecurringCashFlowMode.delete_all) {
        context.client.setQueryData(
          ["singleCashFlows"],
          (old: SingleCashFlow[]) =>
            old.filter(
              (c) => c.recurring_cash_flow_id !== variables.recurringCashFlowId
            )
        );
      } else if (variables.mode === DeleteRecurringCashFlowMode.keep_unlinked) {
        context.client.setQueryData(
          ["singleCashFlows"],
          (old: SingleCashFlow[]) =>
            old.map((c) => ({
              ...c,
              recurring_cash_flow_id: null,
            }))
        );
      }
      showActionSuccessNotification(
        getLocalizedText(
          "Wiederkehrender Cashflow erfolgreich gelöscht",
          "Recurring cash flow deleted successfully"
        ),
        locale
      );
      onSuccess?.();
    },
    onSettled: (data, error, variables, onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: ["recurringCashFlows"],
      });
      context.client.invalidateQueries({
        queryKey: ["singleCashFlows"],
      });
    },
    onError: (error, variables, onMutateResult, context) => {
      showActionErrorNotification(
        getLocalizedText(
          "Fehler beim Löschen der wiederkehrenden Zahlung",
          "Failed to delete recurring cash flow"
        ),
        locale
      );
      onError?.();
    },
  });
}
