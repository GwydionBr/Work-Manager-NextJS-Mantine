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
  const { data, error } = await supabase
    .from("recurring_cash_flow")
    .update(updateRecurringCashFlow)
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
      .in("id", categoryUpdates.deleteIds);

    if (categoryErrorDelete) {
      return { success: false, data: null, error: categoryErrorDelete.message };
    }
  }

  if (categoryUpdates.addIds.length > 0) {
    const { error: categoryErrorAdd } = await supabase.from("recurring_cash_flow_category").insert(
      categoryUpdates.addIds.map((id) => ({
        recurring_cash_flow_id: data.id,
        finance_category_id: id
      }))
    );

    if (categoryErrorAdd) {
      return { success: false, data: null, error: categoryErrorAdd.message };
    }
  }

  return { success: true, data: updateRecurringCashFlow, error: null };
}
