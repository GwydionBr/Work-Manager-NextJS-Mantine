"use server";

import { createClient } from "@/utils/supabase/server";

import { SimpleResponse } from "@/types/action.types";

export async function logout(): Promise<SimpleResponse> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return {
      success: false,
      error: error.message,
      data: null,
    };
  }

  return {
    success: true,
    error: null,
    data: null,
  };
}
