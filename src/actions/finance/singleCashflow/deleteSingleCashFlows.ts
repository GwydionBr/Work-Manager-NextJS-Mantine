"use server";

import { createClient } from "@/utils/supabase/server";
import { SimpleResponse } from "@/types/action.types";

export async function deleteSingleCashFlows({
  ids,
}: {
  ids: string[];
}): Promise<SimpleResponse> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("single_cash_flow")
    .delete()
    .in("id", ids);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}
