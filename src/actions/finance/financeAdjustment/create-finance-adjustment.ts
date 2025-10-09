"use server";

import { createClient } from "@/utils/supabase/server";
import { Tables, TablesInsert } from "@/types/db.types";

export async function createFinanceAdjustment(
  adjustment: TablesInsert<"finance_project_adjustment">
): Promise<Tables<"finance_project_adjustment">> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("finance_project_adjustment")
    .insert(adjustment)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
