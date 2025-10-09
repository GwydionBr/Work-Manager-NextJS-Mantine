"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { getAllFinanceCategories } from "@/actions/finance/financeCategory/get-all-finance-categories";
import { useSettingsStore } from "@/stores/settingsStore";
import { createFinanceCategory } from "@/actions/finance/financeCategory/create-finance-category";
import { Tables, TablesInsert, TablesUpdate } from "@/types/db.types";
import {
  showActionErrorNotification,
  showActionSuccessNotification,
} from "@/utils/notificationFunctions";
import { updateFinanceCategory } from "@/actions/finance/financeCategory/update-finance-category";
import { deleteFinanceCategories } from "@/actions/finance/financeCategory/delete-finance-categories";

// Query to get all finance categories
export function useFinanceCategoriesQuery() {
  return useQuery({
    queryKey: ["financeCategories"],
    queryFn: () => getAllFinanceCategories(),
  });
}

// Mutation to add a finance category
export function useAddFinanceCategoryMutation(
  onSuccess?: (category: Tables<"finance_category">) => void,
  onError?: () => void
) {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["addFinanceCategory"],
    mutationFn: (category: TablesInsert<"finance_category">) =>
      createFinanceCategory({ category }),
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(
        ["financeCategories"],
        (old: Tables<"finance_category">[]) => [data, ...old]
      );
      context.client.invalidateQueries({ queryKey: ["financeCategories"] });
      showActionSuccessNotification(
        getLocalizedText(
          "Kategorie erfolgreich hinzugefügt",
          "Category successfully added"
        ),
        locale
      );
      onSuccess?.(data);
    },
    onError: () => {
      showActionErrorNotification(
        getLocalizedText(
          "Kategorie konnten nicht hinzugefügt werden",
          "Category could not be added"
        ),
        locale
      );
      onError?.();
    },
  });
}

// Mutation to update a finance category
export function useUpdateFinanceCategoryMutation(
  onSuccess?: () => void,
  onError?: () => void
) {
  const { locale, getLocalizedText } = useSettingsStore();
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
      context.client.invalidateQueries({ queryKey: ["financeCategories"] });
      showActionSuccessNotification(
        getLocalizedText(
          "Kategorie erfolgreich aktualisiert",
          "Category successfully updated"
        ),
        locale
      );
      onSuccess?.();
    },
    onError: () => {
      showActionErrorNotification(
        getLocalizedText(
          "Kategorie konnten nicht aktualisiert werden",
          "Category could not be updated"
        ),
        locale
      );
      onError?.();
    },
  });
}

// Mutation to delete a finance category
export function useDeleteFinanceCategoryMutation(
  onSuccess?: () => void,
  onError?: () => void
) {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["deleteFinanceCategory"],
    mutationFn: (ids: string[]) => deleteFinanceCategories({ ids }),
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(
        ["financeCategories"],
        (old: Tables<"finance_category">[]) =>
          old.filter((c) => !variables.includes(c.id))
      );
      context.client.invalidateQueries({ queryKey: ["financeCategories"] });
      showActionSuccessNotification(
        getLocalizedText(
          "Kategorie erfolgreich gelöscht",
          "Category successfully deleted"
        ),
        locale
      );
      onSuccess?.();
    },
    onError: () => {
      showActionErrorNotification(
        getLocalizedText(
          "Kategorie konnten nicht gelöscht werden",
          "Category could not be deleted"
        ),
        locale
      );
      onError?.();
    },
  });
}
