"use server";

import { createClient } from "@/utils/supabase/server";
import { DeleteRecurringCashFlowMode } from "@/types/finance.types";

interface DeleteRecurringCashflowProps {
  recurringCashFlowId: string;
  mode: DeleteRecurringCashFlowMode;
}

export async function deleteRecurringCashflow({
  recurringCashFlowId,
  mode,
}: DeleteRecurringCashflowProps): Promise<boolean> {
  const supabase = await createClient();
  if (mode === DeleteRecurringCashFlowMode.delete_all) {
    const { error: singleCashFlowError } = await supabase
      .from("single_cash_flow")
      .delete()
      .eq("recurring_cash_flow_id", recurringCashFlowId);

    if (singleCashFlowError) {
      throw new Error(singleCashFlowError.message);
    }
  }
  const { error } = await supabase
    .from("recurring_cash_flow")
    .delete()
    .eq("id", recurringCashFlowId);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}
