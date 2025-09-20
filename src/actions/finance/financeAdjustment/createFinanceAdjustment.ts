"use server";

import { createClient } from "@/utils/supabase/server";
import { ApiResponseSingle } from "@/types/action.types";
import { Tables, TablesInsert } from "@/types/db.types";

export async function createFinanceAdjustment(
  adjustment: TablesInsert<"finance_project_adjustment">
): Promise<ApiResponseSingle<Tables<"finance_project_adjustment">>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("finance_project_adjustment")
    .insert(adjustment)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}
