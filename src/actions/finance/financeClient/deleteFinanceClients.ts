"use server";

import { createClient } from "@/utils/supabase/server";
import { SimpleResponse } from "@/types/action.types";

export async function deleteFinanceClients(
  ids: string[]
): Promise<SimpleResponse> {
  const supabase = await createClient();
  const { error } = await supabase.from("client").delete().in("id", ids);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}
