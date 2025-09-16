"use server";

import { createClient } from "@/utils/supabase/server";
import { ApiResponseList } from "@/types/action.types";

export async function getAllSingleCashFlows(): Promise<
  ApiResponseList<"single_cash_flow">
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("single_cash_flow")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}
