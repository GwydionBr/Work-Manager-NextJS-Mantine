"use server";

import { createClient } from "@/utils/supabase/server";
import { ApiResponseSingle } from "@/types/action.types";
import { TablesUpdate } from "@/types/db.types";

export async function getSettings(): Promise<ApiResponseSingle<"settings">> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: "User not found",
      success: false,
    };
  }

  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    return {
      data: null,
      error: error.message,
      success: false,
    };
  }

  return {
    success: true,
    data: data,
    error: null,
  };
}

export async function updateSettings(settings: TablesUpdate<"settings">): Promise<ApiResponseSingle<"settings">> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("settings")
    .update(settings)
    .eq("id", settings.id!)
    .single();

  if (error) {
    return {
      data: null,
      error: error.message,
      success: false,
    };
  }

  return {
    success: true,
    data: data,
    error: null,
  };
}
