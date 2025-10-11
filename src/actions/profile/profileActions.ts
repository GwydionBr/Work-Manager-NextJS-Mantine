"use server";

import { createClient } from "@/utils/supabase/server";
import { TablesInsert, TablesUpdate, Tables } from "@/types/db.types";
import {
  ApiResponseList,
  ApiResponseSingle,
  SimpleResponse,
} from "@/types/action.types";

export async function getOtherProfiles(): Promise<ApiResponseList<Tables<"profiles">>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, data: null, error: "User not found" };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .not("id", "eq", user.id);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function getProfile(): Promise<ApiResponseSingle<Tables<"profiles">>> {
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
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function updateProfile({
  profile,
}: {
  profile: TablesUpdate<"profiles">;
}): Promise<ApiResponseSingle<Tables<"profiles">>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update(profile)
    .eq("id", profile.id!)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}