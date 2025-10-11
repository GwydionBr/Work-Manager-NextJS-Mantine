"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { getAllRecurringCashFlows } from "@/actions/finance/recurringCashflow/get-all-recurring-cashflows";
import { addRecurringCashFlow } from "@/actions/finance/recurringCashflow/create-recurring-cashflow";
import { updateRecurringCashFlow } from "@/actions/finance/recurringCashflow/update-recurring-cashflow";
import {
  DeleteRecurringCashFlowMode,
  InsertRecurringCashFlow,
  RecurringCashFlow,
  SingleCashFlow,
  UpdateRecurringCashFlow,
} from "@/types/finance.types";
import { useSettingsStore } from "@/stores/settingsStore";
import {
  showActionErrorNotification,
  showActionSuccessNotification,
} from "@/utils/notificationFunctions";
import { deleteRecurringCashflow } from "@/actions/finance/recurringCashflow/delete-recurring-cashflow";

// Query to get all recurring cash flows
export function useRecurringCashflowQuery() {
  return useQuery({
    queryKey: ["recurringCashFlows"],
    queryFn: () => getAllRecurringCashFlows(),
  });
}

// Mutation to update a recurring cash flow
export function useUpdateRecurringCashflowMutation(
  onSuccess?: () => void,
  onError?: () => void
) {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["updateRecurringCashFlow"],
    mutationFn: ({
      recurringCashFlow,
      shouldUpdateSingleCashFlows = false,
    }: {
      recurringCashFlow: UpdateRecurringCashFlow;
      shouldUpdateSingleCashFlows?: boolean;
    }) =>
      updateRecurringCashFlow({
        updateRecurringCashFlow: recurringCashFlow,
        shouldUpdateSingleCashFlows,
      }),
    onSuccess: (data, variables, onMutateResult, context) => {
      // Update the recurring cash flow
      context.client.setQueryData(
        ["recurringCashFlows"],
        (old: RecurringCashFlow[]) =>
          old.map((c) =>
            c.id === data.recurringCashFlow.id ? data.recurringCashFlow : c
          )
      );
      context.client.invalidateQueries({
        queryKey: ["recurringCashFlows"],
      });
      // Update the single cash flows if they exist
      if (data.singleCashFlows.length > 0) {
        context.client.setQueryData(
          ["singleCashFlows"],
          (old: SingleCashFlow[]) =>
            old.map((c) =>
              data.singleCashFlows.includes(c)
                ? data.singleCashFlows.find((s) => s.id === c.id)
                : c
            )
        );
        context.client.invalidateQueries({
          queryKey: ["singleCashFlows"],
        });
      }
      showActionSuccessNotification(
        getLocalizedText(
          "Wiederkehrender Cashflow erfolgreich aktualisiert",
          "Recurring cash flow updated successfully"
        ),
        locale
      );
      onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      showActionErrorNotification(
        getLocalizedText(
          "Fehler beim Aktualisieren der wiederkehrenden Zahlung",
          "Failed to update recurring cash flow"
        ),
        locale
      );
      onError?.();
    },
  });
}

// Mutation to add a recurring cash flow
export function useAddRecurringCashflowMutation(
  onSuccess?: () => void,
  onError?: () => void
) {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["addRecurringCashFlow"],
    mutationFn: ({ cashflow }: { cashflow: InsertRecurringCashFlow }) =>
      addRecurringCashFlow({ cashflow }),
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(
        ["recurringCashFlows"],
        (old: RecurringCashFlow[]) => [data.recurringCashFlow, ...old]
      );
      if (data.singleCashFlows.length > 0) {
        context.client.setQueryData(
          ["singleCashFlows"],
          (old: SingleCashFlow[]) => [...data.singleCashFlows, ...old]
        );
      }
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
      if (
        data?.singleCashFlows.length !== undefined &&
        data?.singleCashFlows.length > 0
      ) {
        context.client.invalidateQueries({
          queryKey: ["singleCashFlows"],
        });
      }
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

// Mutation to delete a recurring cash flow
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
