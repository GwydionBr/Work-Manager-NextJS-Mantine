"use server";

import { createClient } from "@/utils/supabase/server";
import { Tables, TablesUpdate } from "@/types/db.types";

export async function updateFinanceAdjustment(
  adjustment: TablesUpdate<"finance_project_adjustment">
): Promise<TablesUpdate<"finance_project_adjustment">> {
  if (!adjustment.id) {
    throw new Error("Adjustment id is required");
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("finance_project_adjustment")
    .update(adjustment)
    .eq("id", adjustment.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
