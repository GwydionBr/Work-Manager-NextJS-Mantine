"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useFormatter } from "@/hooks/useFormatter";

import {
  showActionErrorNotification,
  showActionSuccessNotification,
} from "@/utils/notificationFunctions";

import { getAllBankAccounts } from "@/actions/finance/bankAccount/get-all-bank-accounts";
import { createBankAccount } from "@/actions/finance/bankAccount/create-bank-account";
import { updateBankAccount } from "@/actions/finance/bankAccount/update-bank-account";
import { deleteBankAccounts } from "@/actions/finance/bankAccount/delete-bank-accounts";

import { CustomMutationProps } from "@/types/query.types";
import { BankAccount } from "@/types/finance.types";

type OldData = BankAccount[] | undefined;

const bankAccountQueryKey = ["bankAccounts"];
const addBankAccountMutationKey = ["addBankAccount"];
const updateBankAccountMutationKey = ["updateBankAccount"];
const deleteBankAccountMutationKey = ["deleteBankAccount"];

// Query to get all bank accounts
export function useBankAccountQuery() {
  return useQuery({
    queryKey: bankAccountQueryKey,
    queryFn: () => getAllBankAccounts(),
  });
}

// Mutation to add a bank account
export const useAddBankAccountMutation = ({
  ...props
}: CustomMutationProps<BankAccount> = {}) => {
  const { getLocalizedText } = useFormatter();
  return useMutation({
    mutationKey: addBankAccountMutationKey,
    mutationFn: createBankAccount,
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(bankAccountQueryKey, (oldData: OldData) =>
        oldData ? [data, ...oldData] : undefined
      );
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Bankkonto erfolgreich hinzugefügt",
            "Bank account successfully added"
          )
        );
      }
      props.onSuccess?.(data);
    },
    onError: (error, variables, onMutateResult, context) => {
      console.log("error", error);
      if (props.showNotification !== false) {
        showActionErrorNotification(
          getLocalizedText(
            "Bankkonto konnten nicht hinzugefügt werden",
            "Bank account could not be added"
          )
        );
      }
      props.onError?.();
    },
  });
};

// Mutation to update a bank account
export const useUpdateBankAccountMutation = ({
  ...props
}: CustomMutationProps<BankAccount> = {}) => {
  const { getLocalizedText } = useFormatter();
  return useMutation({
    mutationKey: updateBankAccountMutationKey,
    mutationFn: updateBankAccount,
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(bankAccountQueryKey, (oldData: OldData) =>
        oldData ? oldData.map((b) => (b.id === data.id ? data : b)) : undefined
      );
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Bankkonto erfolgreich aktualisiert",
            "Bank account successfully updated"
          )
        );
      }
      props.onSuccess?.(data);
    },
    onError: (error, variables, onMutateResult, context) => {
      console.log("error", error);
      if (props.showNotification !== false) {
        showActionErrorNotification(
          getLocalizedText(
            "Bankkonto konnten nicht aktualisiert werden",
            "Bank account could not be updated"
          )
        );
      }
      props.onError?.();
    },
  });
};

// Mutation to delete a bank account
export const useDeleteBankAccountMutation = ({
  ...props
}: CustomMutationProps = {}) => {
  const { getLocalizedText } = useFormatter();
  return useMutation({
    mutationKey: deleteBankAccountMutationKey,
    mutationFn: deleteBankAccounts,
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(bankAccountQueryKey, (oldData: OldData) =>
        oldData ? oldData.filter((b) => !variables.includes(b.id)) : undefined
      );
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Bankkonto erfolgreich gelöscht",
            "Bank account successfully deleted"
          )
        );
      }
      props.onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      console.log("error", error);
      if (props.showNotification !== false) {
        showActionErrorNotification(
          getLocalizedText(
            "Bankkonto konnten nicht gelöscht werden",
            "Bank account could not be deleted"
          )
        );
      }
      props.onError?.();
    },
  });
};
