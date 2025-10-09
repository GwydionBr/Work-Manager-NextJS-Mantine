"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useSettingsStore } from "@/stores/settingsStore";

import { getAllFinanceClients } from "@/actions/finance/financeClient/get-all-finance-clients";
import { Tables, TablesInsert, TablesUpdate } from "@/types/db.types";
import { createFinanceClient } from "@/actions/finance/financeClient/create-finance-client";
import { showActionErrorNotification } from "@/utils/notificationFunctions";
import { showActionSuccessNotification } from "@/utils/notificationFunctions";
import { updateFinanceClient } from "@/actions/finance/financeClient/update-finance-client";
import { deleteFinanceClients } from "@/actions/finance/financeClient/delete-finance-clients";

// Query to get all finance clients
export function useFinanceClientQuery() {
  return useQuery({
    queryKey: ["financeClients"],
    queryFn: () => getAllFinanceClients(),
  });
}

// Mutation to add a finance client
export function useAddFinanceClientMutation(
  onSuccess?: (client: Tables<"finance_client">) => void,
  onError?: () => void
) {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["addFinanceClient"],
    mutationFn: (financeClient: TablesInsert<"finance_client">) =>
      createFinanceClient(financeClient),
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(
        ["financeClients"],
        (old: Tables<"finance_client">[]) => [data, ...old]
      );
      context.client.invalidateQueries({ queryKey: ["financeClients"] });
      showActionSuccessNotification(
        getLocalizedText(
          "Finanzkunde erfolgreich hinzugefügt",
          "Finance client successfully added"
        ),
        locale
      );
      onSuccess?.(data);
    },
    onError: (error, variables, onMutateResult, context) => {
      showActionErrorNotification(
        getLocalizedText(
          "Finanzkunde konnten nicht hinzugefügt werden",
          "Finance client could not be added"
        ),
        locale
      );
      onError?.();
    },
  });
}

// Mutation to update a finance client
export function useUpdateFinanceClientMutation(
  onSuccess?: () => void,
  onError?: () => void
) {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["updateFinanceClient"],
    mutationFn: (financeClient: TablesUpdate<"finance_client">) =>
      updateFinanceClient(financeClient),
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(
        ["financeClients"],
        (old: Tables<"finance_client">[]) =>
          old.map((c) => (c.id === data.id ? data : c))
      );
      context.client.invalidateQueries({ queryKey: ["financeClients"] });
      showActionSuccessNotification(
        getLocalizedText(
          "Finanzkunde erfolgreich aktualisiert",
          "Finance client successfully updated"
        ),
        locale
      );
      onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      showActionErrorNotification(
        getLocalizedText(
          "Finanzkunde konnten nicht aktualisiert werden",
          "Finance client could not be updated"
        ),
        locale
      );
      onError?.();
    },
  });
}

// Mutation to delete a finance client
export function useDeleteFinanceClientMutation(
  onSuccess?: () => void,
  onError?: () => void
) {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["deleteFinanceClient"],
    mutationFn: (ids: string[]) => deleteFinanceClients(ids),
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(
        ["financeClients"],
        (old: Tables<"finance_client">[]) =>
          old.filter((c) => !variables.includes(c.id))
      );
      context.client.invalidateQueries({ queryKey: ["financeClients"] });
      showActionSuccessNotification(
        getLocalizedText(
          "Finanzkunde erfolgreich gelöscht",
          "Finance client successfully deleted"
        ),
        locale
      );
      onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      showActionErrorNotification(
        getLocalizedText(
          "Finanzkunde konnten nicht gelöscht werden",
          "Finance client could not be deleted"
        ),
        locale
      );
      onError?.();
    },
  });
}
