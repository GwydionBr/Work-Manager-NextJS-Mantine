"use server";

import { createClient } from "@/utils/supabase/server";

export async function deleteSingleCashFlows({ ids }: { ids: string[] }) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("single_cash_flow")
    .delete()
    .in("id", ids);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}
