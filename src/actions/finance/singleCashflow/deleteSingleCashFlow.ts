"use server";

import { createClient } from "@/utils/supabase/server";
import { SimpleResponse } from "@/types/action.types";

export async function deleteSingleCashFlow({
  singleCashFlowId,
}: {
  singleCashFlowId: string;
}): Promise<SimpleResponse> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("single_cash_flow")
    .delete()
    .eq("id", singleCashFlowId);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}
