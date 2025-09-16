"use server";

import { createClient } from "@/utils/supabase/server";
import { ApiResponseSingle } from "@/types/action.types";
import { TablesInsert } from "@/types/db.types";

export async function createFinanceClient(
  client: TablesInsert<"finance_client">
): Promise<ApiResponseSingle<"finance_client">> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("finance_client")
    .insert({ ...client })
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}
