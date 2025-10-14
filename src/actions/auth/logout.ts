"use server";

import { createClient } from "@/utils/supabase/server";

export async function logout(): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }

  return true;
}
