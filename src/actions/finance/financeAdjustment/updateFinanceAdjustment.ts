"use server";

import { createClient } from "@/utils/supabase/server";
import { ApiResponseSingle } from "@/types/action.types";
import { TablesUpdate } from "@/types/db.types";

export async function updateFinanceAdjustment(
  adjustment: TablesUpdate<"finance_project_adjustment">
): Promise<ApiResponseSingle<"finance_project_adjustment">> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("finance_project_adjustment")
    .update(adjustment)
    .eq("id", adjustment.id!)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}
