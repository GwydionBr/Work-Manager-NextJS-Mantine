"use server";

import { createClient } from "@/utils/supabase/server";
import { ApiResponseList } from "@/types/action.types";
import { Tables } from "@/types/db.types";

export async function getAllPayouts(): Promise<
  ApiResponseList<Tables<"payout">>
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, data: null, error: "User not found" };
  }

  const { data, error } = await supabase
    .from("payout")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}
