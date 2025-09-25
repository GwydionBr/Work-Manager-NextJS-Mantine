"use server";

import { ApiResponseSingle, UpdateManyToMany } from "@/types/action.types";
import { createClient } from "@/utils/supabase/server";
import { StoreSingleCashFlow } from "@/types/finance.types";

interface UpdateSingleCashFlowProps {
  updateSingleCashFlow: StoreSingleCashFlow;
  categoryUpdates: UpdateManyToMany;
}

export async function updateSingleCashFlow({
  updateSingleCashFlow,
  categoryUpdates,
}: UpdateSingleCashFlowProps): Promise<ApiResponseSingle<StoreSingleCashFlow>> {
  const supabase = await createClient();

  const { categoryIds, ...singleCashFlowData } = updateSingleCashFlow;

  // Update the single cash flow
  const { data, error } = await supabase
    .from("single_cash_flow")
    .update(singleCashFlowData)
    .eq("id", updateSingleCashFlow.id)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  // Delete the categories
  if (categoryUpdates.deleteIds.length > 0) {
    const { error: categoryErrorDelete } = await supabase
      .from("single_cash_flow_category")
      .delete()
      .eq("single_cash_flow_id", data.id)
      .in("finance_category_id", categoryUpdates.deleteIds);

    if (categoryErrorDelete) {
      return { success: false, data: null, error: categoryErrorDelete.message };
    }
  }

  // Add the categories
  if (categoryUpdates.addIds.length > 0) {
    const { error: categoryErrorAdd } = await supabase
      .from("single_cash_flow_category")
      .insert(
        categoryUpdates.addIds.map((id) => ({
          single_cash_flow_id: data.id,
          finance_category_id: id,
        }))
      );

    if (categoryErrorAdd) {
      return { success: false, data: null, error: categoryErrorAdd.message };
    }
  }

  // Update the categoryIds
  let newCategoryIds = categoryIds;
  // Add the categories
  if (categoryUpdates.addIds.length > 0) {
    newCategoryIds = [...newCategoryIds, ...categoryUpdates.addIds];
  }
  // Delete the categories
  if (categoryUpdates.deleteIds.length > 0) {
    newCategoryIds = newCategoryIds.filter(
      (id) => !categoryUpdates.deleteIds.includes(id)
    );
  }

  // Update the single cash flow
  const newSingleCashFlow = { ...data, categoryIds: newCategoryIds };

  // Return the new single cash flow
  return { success: true, data: newSingleCashFlow, error: null };
}
