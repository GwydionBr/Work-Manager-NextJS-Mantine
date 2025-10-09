"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useSettingsStore } from "@/stores/settingsStore";
import { getAllSingleCashFlows } from "@/actions/finance/singleCashflow/get-all-single-cashflows";
import { deleteSingleCashFlows } from "@/actions/finance/singleCashflow/delete-single-cashflows";
import {
  showActionErrorNotification,
  showActionSuccessNotification,
} from "@/utils/notificationFunctions";
import { addSingleCashFlow } from "@/actions/finance/singleCashflow/add-single-cashflow";
import {
  InsertSingleCashFlow,
  SingleCashFlow,
  UpdateSingleCashFlow,
} from "@/types/finance.types";
import { updateSingleCashFlow } from "@/actions/finance/singleCashflow/update-single-cashflow";

// Query to get all single cash flows
export function useSingleCashflowQuery() {
  return useQuery({
    queryKey: ["singleCashFlows"],
    queryFn: () => getAllSingleCashFlows(),
  });
}

// Mutation to update a single cash flow
export function useUpdateSingleCashflowMutation(
  onSuccess?: () => void,
  onError?: () => void
) {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["updateSingleCashFlow"],
    mutationFn: ({ cashflow }: { cashflow: UpdateSingleCashFlow }) =>
      updateSingleCashFlow({ updateSingleCashFlow: cashflow }),
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(
        ["singleCashFlows"],
        (old: SingleCashFlow[]) =>
          old.map((cashflow) => (cashflow.id === data.id ? data : cashflow))
      );
      context.client.invalidateQueries({
        queryKey: ["singleCashFlows"],
      });
      showActionSuccessNotification(
        getLocalizedText("Cashflow aktualisiert", "Cashflow updated"),
        locale
      );
      onSuccess?.();
    },
    onError: () => {
      showActionErrorNotification(
        getLocalizedText(
          "Cashflow konnten nicht aktualisiert werden",
          "Cashflow could not be updated"
        ),
        locale
      );
      onError?.();
    },
  });
}

// Mutation to add a single cash flow
export function useAddSingleCashflowMutation(
  onSuccess?: () => void,
  onError?: () => void
) {
  const { locale, getLocalizedText } = useSettingsStore();

  return useMutation({
    mutationKey: ["addSingleCashFlow"],
    mutationFn: ({ cashflow }: { cashflow: InsertSingleCashFlow }) =>
      addSingleCashFlow({ cashflow }),
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(
        ["singleCashFlows"],
        (old: SingleCashFlow[]) => [data, ...old]
      );
      context.client.invalidateQueries({
        queryKey: ["singleCashFlows"],
      });
      showActionSuccessNotification(
        getLocalizedText("Cashflow hinzugefügt", "Cashflow added"),
        locale
      );
      onSuccess?.();
    },
    onError: () => {
      showActionErrorNotification(
        getLocalizedText(
          "Cashflow konnten nicht hinzugefügt werden",
          "Cashflow could not be added"
        ),
        locale
      );
      onError?.();
    },
  });
}

// Mutation to delete a single cash flow
export function useDeleteSingleCashflowMutation(
  onSuccess?: () => void,
  onError?: () => void
) {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["deleteSingleCashFlows"],
    mutationFn: (ids: string[]) => deleteSingleCashFlows({ ids }),
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(
        ["singleCashFlows"],
        (old: SingleCashFlow[]) =>
          old.filter((cashflow) => !variables.includes(cashflow.id))
      );
      context.client.invalidateQueries({
        queryKey: ["singleCashFlows"],
      });
      showActionSuccessNotification(
        getLocalizedText("Cashflow gelöscht", "Cashflow deleted"),
        locale
      );
      onSuccess?.();
    },
    onError: () => {
      showActionErrorNotification(
        getLocalizedText(
          "Cashflow konnten nicht gelöscht werden",
          "Income could not be deleted"
        ),
        locale
      );
      onError?.();
    },
  });
}
