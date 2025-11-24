"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useFormatter } from "@/hooks/useFormatter";

import { getAllFinanceClients } from "@/actions/finance/financeClient/get-all-finance-clients";
import { Tables, TablesInsert, TablesUpdate } from "@/types/db.types";
import { createFinanceClient } from "@/actions/finance/financeClient/create-finance-client";
import { showActionErrorNotification } from "@/utils/notificationFunctions";
import { showActionSuccessNotification } from "@/utils/notificationFunctions";
import { updateFinanceClient } from "@/actions/finance/financeClient/update-finance-client";
import { deleteFinanceClients } from "@/actions/finance/financeClient/delete-finance-clients";
import { CustomMutationProps } from "@/types/query.types";

// Query to get all finance clients
export const useFinanceClientQuery = () => {
  return useQuery({
    queryKey: ["financeClients"],
    queryFn: () => getAllFinanceClients(),
  });
};

// Mutation to add a finance client
export const useAddFinanceClientMutation = ({
  ...props
}: CustomMutationProps<Tables<"finance_client">> = {}) => {
  const { getLocalizedText } = useFormatter();
  return useMutation({
    mutationKey: ["addFinanceClient"],
    mutationFn: (financeClient: TablesInsert<"finance_client">) =>
      createFinanceClient(financeClient),
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(
        ["financeClients"],
        (old: Tables<"finance_client">[]) => [data, ...old]
      );
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Finanzkunde erfolgreich hinzugefügt",
            "Finance client successfully added"
          )
        );
      }
      props.onSuccess?.(data);
    },
    onError: (error, variables, onMutateResult, context) => {
      if (props.showNotification !== false) {
        showActionErrorNotification(
          getLocalizedText(
            "Finanzkunde konnten nicht hinzugefügt werden",
            "Finance client could not be added"
          )
        );
      }
      props.onError?.();
    },
  });
};

// Mutation to update a finance client
export const useUpdateFinanceClientMutation = ({
  ...props
}: CustomMutationProps = {}) => {
  const { getLocalizedText } = useFormatter();
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
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Finanzkunde erfolgreich aktualisiert",
            "Finance client successfully updated"
          )
        );
      }
      props.onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      if (props.showNotification !== false) {
        showActionErrorNotification(
          getLocalizedText(
            "Finanzkunde konnten nicht aktualisiert werden",
            "Finance client could not be updated"
          )
        );
      }
      props.onError?.();
    },
  });
};

// Mutation to delete a finance client
export const useDeleteFinanceClientMutation = ({
  ...props
}: CustomMutationProps = {}) => {
  const { getLocalizedText } = useFormatter();
  return useMutation({
    mutationKey: ["deleteFinanceClient"],
    mutationFn: (ids: string[]) => deleteFinanceClients(ids),
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(
        ["financeClients"],
        (old: Tables<"finance_client">[]) =>
          old.filter((c) => !variables.includes(c.id))
      );
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Finanzkunde erfolgreich gelöscht",
            "Finance client successfully deleted"
          )
        );
      }
      props.onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      if (props.showNotification !== false) {
        showActionErrorNotification(
          getLocalizedText(
            "Finanzkunde konnten nicht gelöscht werden",
            "Finance client could not be deleted"
          )
        );
      }
      props.onError?.();
    },
  });
};
