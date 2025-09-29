"use server";

import { createClient } from "@/utils/supabase/server";
import { TablesUpdate, Tables } from "@/types/db.types";
import { ApiResponseList, UpdateManyToMany } from "@/types/action.types";

export async function updateMultipleSingleCashFlows({
  recurringCashFlowId,
  updates,
  categoryUpdates,
}: {
  recurringCashFlowId: string;
  updates: Partial<TablesUpdate<"single_cash_flow">>;
  categoryUpdates: UpdateManyToMany;
}): Promise<ApiResponseList<Tables<"single_cash_flow">>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: "User not found",
      success: false,
    };
  }

  // Update all single cash flows that belong to this recurring cash flow
  const { data, error } = await supabase
    .from("single_cash_flow")
    .update(updates)
    .eq("recurring_cash_flow_id", recurringCashFlowId)
    .eq("user_id", user.id)
    .select();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  if (categoryUpdates.deleteIds.length > 0) {
    const { error: categoryErrorDelete } = await supabase
      .from("single_cash_flow_category")
      .delete()
      .in(
        "single_cash_flow_id",
        data.map((cashFlow) => cashFlow.id)
      )
      .in("finance_category_id", categoryUpdates.deleteIds);

    if (categoryErrorDelete) {
      return {
        success: false,
        data: null,
        error: categoryErrorDelete.message,
      };
    }
  }

  if (categoryUpdates.addIds.length > 0) {
    const { error: categoryErrorAdd } = await supabase
      .from("single_cash_flow_category")
      .insert(
        categoryUpdates.addIds.flatMap((id) => {
          return data.map((cashFlow) => ({
            single_cash_flow_id: cashFlow.id,
            finance_category_id: id,
            user_id: user.id,
          }));
        })
      );

    if (categoryErrorAdd) {
      return { success: false, data: null, error: categoryErrorAdd.message };
    }
  }

  return { success: true, data, error: null };
}
