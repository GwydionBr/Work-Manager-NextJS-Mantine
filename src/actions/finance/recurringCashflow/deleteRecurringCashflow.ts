"use server";

import { createClient } from "@/utils/supabase/server";
import { SimpleResponse } from "@/types/action.types";
import { DeleteRecurringCashFlowMode } from "@/types/finance.types";

export async function deleteRecurringCashFlow({
  recurringCashFlowId,
  mode,
}: {
  recurringCashFlowId: string;
  mode: DeleteRecurringCashFlowMode;
}): Promise<SimpleResponse> {
  const supabase = await createClient();
  if (mode === DeleteRecurringCashFlowMode.delete_all) {
    const { error: singleCashFlowError } = await supabase
      .from("single_cash_flow")
      .delete()
      .eq("recurring_cash_flow_id", recurringCashFlowId);

    if (singleCashFlowError) {
      return { success: false, data: null, error: singleCashFlowError.message };
    }
  }
  const { error } = await supabase
    .from("recurring_cash_flow")
    .delete()
    .eq("id", recurringCashFlowId);

  if (error) {
    console.log("error", error);
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}
