"use server";

import { createClient } from "@/utils/supabase/server";

export async function deleteFinanceAdjustments(
  adjustmentIds: string[]
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("finance_project_adjustment")
    .delete()
    .in("id", adjustmentIds);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}
