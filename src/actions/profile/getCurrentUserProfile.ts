"use server";

import { createClient } from "@/utils/supabase/server";

import { ApiResponseSingle } from "@/types/action.types";

export async function getCurrentUserProfile(): Promise<
  ApiResponseSingle<"profiles">
> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (profileError) {
    return { success: false, error: profileError.message, data: null };
  }

  return { success: true, error: null, data: profile };
}
