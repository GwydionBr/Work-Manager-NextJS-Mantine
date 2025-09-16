"use server";

import { createClient } from "@/utils/supabase/server";
import { SimpleResponse } from "@/types/action.types";

export async function deleteFinanceClient(id: string): Promise<SimpleResponse> {
  const supabase = await createClient();
  const { error } = await supabase.from("client").delete().eq("id", id);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}
