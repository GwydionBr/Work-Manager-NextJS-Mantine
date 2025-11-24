"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useFormatter } from "@/hooks/useFormatter";

import { getAllFinanceCategories } from "@/actions/finance/financeCategory/get-all-finance-categories";
import { createFinanceCategory } from "@/actions/finance/financeCategory/create-finance-category";
import { Tables, TablesInsert, TablesUpdate } from "@/types/db.types";
import {
  showActionErrorNotification,
  showActionSuccessNotification,
} from "@/utils/notificationFunctions";
import { updateFinanceCategory } from "@/actions/finance/financeCategory/update-finance-category";
import { deleteFinanceCategories } from "@/actions/finance/financeCategory/delete-finance-categories";
import { CustomMutationProps } from "@/types/query.types";

// Query to get all finance categories
export const useFinanceCategoriesQuery = () => {
  return useQuery({
    queryKey: ["financeCategories"],
    queryFn: () => getAllFinanceCategories(),
  });
};

// Mutation to add a finance category
export const useAddFinanceCategoryMutation = ({
  ...props
}: CustomMutationProps<Tables<"finance_category">> = {}) => {
  const { getLocalizedText } = useFormatter();
  return useMutation({
    mutationKey: ["addFinanceCategory"],
    mutationFn: (category: TablesInsert<"finance_category">) =>
      createFinanceCategory({ category }),
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(
        ["financeCategories"],
        (old: Tables<"finance_category">[]) => [data, ...old]
      );
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Kategorie erfolgreich hinzugefügt",
            "Category successfully added"
          )
        );
      }
      props.onSuccess?.(data);
    },
    onError: () => {
      if (props.showNotification !== false) {
        showActionErrorNotification(
          getLocalizedText(
            "Kategorie konnten nicht hinzugefügt werden",
            "Category could not be added"
          )
        );
      }
      props.onError?.();
    },
  });
};

// Mutation to update a finance category
export const useUpdateFinanceCategoryMutation = ({
  ...props
}: CustomMutationProps = {}) => {
  const { getLocalizedText } = useFormatter();
  return useMutation({
    mutationKey: ["updateFinanceCategory"],
    mutationFn: (category: TablesUpdate<"finance_category">) =>
      updateFinanceCategory({ category }),
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(
        ["financeCategories"],
        (old: Tables<"finance_category">[]) =>
          old.map((c) => (c.id === data.id ? data : c))
      );
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Kategorie erfolgreich aktualisiert",
            "Category successfully updated"
          )
        );
      }
      props.onSuccess?.();
    },
    onError: () => {
      if (props.showNotification !== false) {
        showActionErrorNotification(
          getLocalizedText(
            "Kategorie konnten nicht aktualisiert werden",
            "Category could not be updated"
          )
        );
      }
      props.onError?.();
    },
  });
};

// Mutation to delete a finance category
export const useDeleteFinanceCategoryMutation = ({
  ...props
}: CustomMutationProps = {}) => {
  const { getLocalizedText } = useFormatter();
  return useMutation({
    mutationKey: ["deleteFinanceCategory"],
    mutationFn: (ids: string[]) => deleteFinanceCategories({ ids }),
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(
        ["financeCategories"],
        (old: Tables<"finance_category">[]) =>
          old.filter((c) => !variables.includes(c.id))
      );
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Kategorie erfolgreich gelöscht",
            "Category successfully deleted"
          )
        );
      }
      props.onSuccess?.();
    },
    onError: () => {
      if (props.showNotification !== false) {
        showActionErrorNotification(
          getLocalizedText(
            "Kategorie konnten nicht gelöscht werden",
            "Category could not be deleted"
          )
        );
      }
      props.onError?.();
    },
  });
};
