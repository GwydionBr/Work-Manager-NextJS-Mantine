"use server";

import { createClient } from "@/utils/supabase/server";
import { ApiResponseList } from "@/types/action.types";

export async function getAllPayouts(): Promise<ApiResponseList<"payout">> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payout")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}
