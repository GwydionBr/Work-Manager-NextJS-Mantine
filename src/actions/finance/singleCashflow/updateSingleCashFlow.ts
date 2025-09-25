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
  const { data, error } = await supabase
    .from("single_cash_flow")
    .update(updateSingleCashFlow)
    .eq("id", updateSingleCashFlow.id)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  if (categoryUpdates.deleteIds.length > 0) {
    const { error: categoryErrorDelete } = await supabase
      .from("single_cash_flow_category")
      .delete()
      .in("id", categoryUpdates.deleteIds);

    if (categoryErrorDelete) {
      return { success: false, data: null, error: categoryErrorDelete.message };
    }
  }

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

  return { success: true, data: updateSingleCashFlow, error: null };
}
