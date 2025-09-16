"use server";

import { createClient } from "@/utils/supabase/server";
import { ApiResponseSingle } from "@/types/action.types";
import { TablesInsert } from "@/types/db.types";

export async function createFinanceProject(
  project: TablesInsert<"finance_project">
): Promise<ApiResponseSingle<"finance_project">> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("finance_project")
    .insert(project)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}
