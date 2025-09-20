"use server";

import { TablesUpdate, Tables } from "@/types/db.types";
import { ApiResponseSingle } from "@/types/action.types";
import { createClient } from "@/utils/supabase/server";

export async function updateSingleCashFlow({
  updateSingleCashFlow,
}: {
  updateSingleCashFlow: TablesUpdate<"single_cash_flow">;
}): Promise<ApiResponseSingle<Tables<"single_cash_flow">>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("single_cash_flow")
    .update(updateSingleCashFlow)
    .eq("id", updateSingleCashFlow.id!)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}
