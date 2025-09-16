"use server";

import { createClient } from "@/utils/supabase/server";
import { TablesUpdate } from "@/types/db.types";
import { ApiResponseList } from "@/types/action.types";

export async function updateMultipleSingleCashFlows({
  recurringCashFlowId,
  updates,
}: {
  recurringCashFlowId: string;
  updates: Partial<TablesUpdate<"single_cash_flow">>;
}): Promise<ApiResponseList<"single_cash_flow">> {
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

  return { success: true, data, error: null };
}
