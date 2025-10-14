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
import { CustomMutationProps } from "@/types/query.types";

// Query to get all recurring cash flows
export const useRecurringCashflowQuery = () => {
  return useQuery({
    queryKey: ["recurringCashFlows"],
    queryFn: () => getAllRecurringCashFlows(),
  });
};

// Mutation to update a recurring cash flow
export const useUpdateRecurringCashflowMutation = ({
  ...props
}: CustomMutationProps) => {
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
      }
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Wiederkehrender Cashflow erfolgreich aktualisiert",
            "Recurring cash flow updated successfully"
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
            "Fehler beim Aktualisieren der wiederkehrenden Zahlung",
            "Failed to update recurring cash flow"
          ),
          locale
        );
      }
      props.onError?.();
    },
  });
};

// Mutation to add a recurring cash flow
export const useAddRecurringCashflowMutation = ({
  ...props
}: CustomMutationProps) => {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["addRecurringCashFlow"],
    mutationFn: addRecurringCashFlow,
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
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Wiederkehrender Cashflow erfolgreich hinzugefügt",
            "Recurring cash flow added successfully"
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
            "Fehler beim Hinzufügen der wiederkehrenden Zahlung",
            "Failed to add recurring cash flow"
          ),
          locale
        );
      }
      props.onError?.();
    },
  });
};

// Mutation to delete a recurring cash flow
export const useDeleteRecurringCashflowMutation = ({
  ...props
}: CustomMutationProps) => {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["deleteRecurringCashFlow"],
    mutationFn: deleteRecurringCashflow,
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
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Wiederkehrender Cashflow erfolgreich gelöscht",
            "Recurring cash flow deleted successfully"
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
            "Fehler beim Löschen der wiederkehrenden Zahlung",
            "Failed to delete recurring cash flow"
          ),
          locale
        );
      }
      props.onError?.();
    },
  });
};
