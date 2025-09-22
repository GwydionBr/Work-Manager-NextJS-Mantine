"use server";

import { createClient } from "@/utils/supabase/server";
import { ApiResponseSingle } from "@/types/action.types";
import { FinanceProject, FinanceProjectUpdate } from "@/types/finance.types";

export async function updateFinanceProject(
  project: FinanceProjectUpdate
): Promise<ApiResponseSingle<FinanceProject>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("finance_project")
    .update(project)
    .eq("id", project.id!)
    .select()
    .single();
    
  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: data as FinanceProject, error: null };
}