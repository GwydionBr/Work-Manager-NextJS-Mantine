"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useSettingsStore } from "@/stores/settingsStore";
import { getAllSingleCashFlows } from "@/actions/finance/singleCashflow/get-all-single-cashflows";
import { deleteSingleCashFlows } from "@/actions/finance/singleCashflow/delete-single-cashflows";
import {
  showActionErrorNotification,
  showActionSuccessNotification,
} from "@/utils/notificationFunctions";
import { addSingleCashFlow } from "@/actions/finance/singleCashflow/create-single-cashflow";
import {
  InsertSingleCashFlow,
  SingleCashFlow,
  UpdateSingleCashFlow,
} from "@/types/finance.types";
import { updateSingleCashFlow } from "@/actions/finance/singleCashflow/update-single-cashflow";
import { CustomMutationProps } from "@/types/query.types";

// Query to get all single cash flows
export const useSingleCashflowQuery = () => {
  return useQuery({
    queryKey: ["singleCashFlows"],
    queryFn: () => getAllSingleCashFlows(),
  });
};

// Mutation to update a single cash flow
export const useUpdateSingleCashflowMutation = ({
  ...props
}: CustomMutationProps) => {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["updateSingleCashFlow"],
    mutationFn: ({
      singleCashFlow,
    }: {
      singleCashFlow: UpdateSingleCashFlow;
    }) => updateSingleCashFlow({ updateSingleCashFlow: singleCashFlow }),
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(
        ["singleCashFlows"],
        (old: SingleCashFlow[]) =>
          old.map((cashflow) => (cashflow.id === data.id ? data : cashflow))
      );
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText("Cashflow aktualisiert", "Cashflow updated"),
          locale
        );
      }
      props.onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      if (props.showNotification !== false) {
        showActionErrorNotification(
          getLocalizedText(
            "Cashflow konnten nicht aktualisiert werden",
            "Cashflow could not be updated"
          ),
          locale
        );
      }
      props.onError?.();
    },
  });
};

// Mutation to add a single cash flow
export const useAddSingleCashflowMutation = ({
  ...props
}: CustomMutationProps) => {
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
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText("Cashflow hinzugefügt", "Cashflow added"),
          locale
        );
      }
      props.onSuccess?.();
    },
    onError: () => {
      if (props.showNotification !== false) {
        showActionErrorNotification(
          getLocalizedText(
            "Cashflow konnten nicht hinzugefügt werden",
            "Cashflow could not be added"
          ),
          locale
        );
      }
      props.onError?.();
    },
  });
};

// Mutation to delete a single cash flow
export const useDeleteSingleCashflowMutation = ({
  ...props
}: CustomMutationProps) => {
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
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText("Cashflow gelöscht", "Cashflow deleted"),
          locale
        );
      }
      props.onSuccess?.();
    },
    onError: () => {
      if (props.showNotification !== false) {
        showActionErrorNotification(
          getLocalizedText(
            "Cashflow konnten nicht gelöscht werden",
            "Income could not be deleted"
          ),
          locale
        );
      }
      props.onError?.();
    },
  });
};
