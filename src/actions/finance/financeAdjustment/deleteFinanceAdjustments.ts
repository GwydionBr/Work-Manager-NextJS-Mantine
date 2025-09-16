"use server";

import { createClient } from "@/utils/supabase/server";
import { SimpleResponse } from "@/types/action.types";

export async function deleteFinanceAdjustments(
  adjustmentIds: string[]
): Promise<SimpleResponse> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("finance_project_adjustment")
    .delete()
    .in("id", adjustmentIds);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}
