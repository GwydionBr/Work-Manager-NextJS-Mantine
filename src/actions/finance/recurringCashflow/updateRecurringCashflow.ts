"use server";

import { createClient } from "@/utils/supabase/server";
import { ApiResponseSingle, UpdateManyToMany } from "@/types/action.types";
import { StoreRecurringCashFlow } from "@/types/finance.types";

interface UpdateRecurringCashFlowProps {
  updateRecurringCashFlow: StoreRecurringCashFlow;
  categoryUpdates: UpdateManyToMany;
}

export async function updateRecurringCashFlow({
  updateRecurringCashFlow,
  categoryUpdates,
}: UpdateRecurringCashFlowProps): Promise<
  ApiResponseSingle<StoreRecurringCashFlow>
> {
  const supabase = await createClient();

  const { categoryIds, ...recurringCashFlowData } = updateRecurringCashFlow;

  const { data, error } = await supabase
    .from("recurring_cash_flow")
    .update(recurringCashFlowData)
    .eq("id", updateRecurringCashFlow.id!)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  if (categoryUpdates.deleteIds.length > 0) {
    const { error: categoryErrorDelete } = await supabase
      .from("recurring_cash_flow_category")
      .delete()
      .eq("recurring_cash_flow_id", data.id)
      .in("finance_category_id", categoryUpdates.deleteIds);

    if (categoryErrorDelete) {
      return { success: false, data: null, error: categoryErrorDelete.message };
    }
  }

  if (categoryUpdates.addIds.length > 0) {
    const { error: categoryErrorAdd } = await supabase
      .from("recurring_cash_flow_category")
      .insert(
        categoryUpdates.addIds.map((id) => ({
          recurring_cash_flow_id: data.id,
          finance_category_id: id,
        }))
      );

    if (categoryErrorAdd) {
      return { success: false, data: null, error: categoryErrorAdd.message };
    }
  }

  // Update the categoryIds
  let newCategoryIds = updateRecurringCashFlow.categoryIds;
  if (categoryUpdates.deleteIds.length > 0) {
    newCategoryIds = newCategoryIds.filter(
      (id) => !categoryUpdates.deleteIds.includes(id)
    );
  }
  if (categoryUpdates.addIds.length > 0) {
    newCategoryIds = [...newCategoryIds, ...categoryUpdates.addIds];
  }

  const newRecurringCashFlow = { ...data, categoryIds: newCategoryIds };

  return { success: true, data: newRecurringCashFlow, error: null };
}
