import { useMutation, useQuery } from "@tanstack/react-query";
import { useSettingsStore } from "@/stores/settingsStore";
import { getAllSingleCashFlows } from "@/actions/finance/singleCashflow/get-all-single-cashflows";
import { deleteSingleCashFlows } from "@/actions/finance/singleCashflow/delete-single-cashflows";
import {
  showActionErrorNotification,
  showActionSuccessNotification,
} from "@/utils/notificationFunctions";
import { addSingleCashFlow } from "@/actions/finance/singleCashflow/add-single-cashflow";
import { TablesInsert } from "@/types/db.types";
import { SingleCashFlow } from "@/types/finance.types";

export function useSingleCashflowQuery() {
  return useQuery({
    queryKey: ["singleCashFlows"],
    queryFn: () => getAllSingleCashFlows(),
  });
}

export function useAddSingleCashflowMutation(
  onSuccess?: () => void,
  onError?: () => void
) {
  const { locale, getLocalizedText } = useSettingsStore();

  return useMutation({
    mutationKey: ["addSingleCashFlow"],
    mutationFn: async ({
      cashflow,
      categoryIds,
    }: {
      cashflow: TablesInsert<"single_cash_flow">;
      categoryIds: string[];
    }) => {
      return await addSingleCashFlow({ cashflow, categoryIds });
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(
        ["singleCashFlows"],
        (old: SingleCashFlow[]) => [data, ...old]
      );
      showActionSuccessNotification(
        getLocalizedText("Cashflow hinzugefügt", "Cashflow added"),
        locale
      );
      onSuccess?.();
    },
    onSettled: (data, error, variables, onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: ["singleCashFlows"],
      });
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
      showActionSuccessNotification(
        getLocalizedText("Cashflow gelöscht", "Cashflow deleted"),
        locale
      );
      onSuccess?.();
    },
    onSettled: (data, error, variables, onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: ["singleCashFlows"],
      });
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
