"use server";

import { Tables } from "@/types/db.types";
import { createClient } from "@/utils/supabase/server";

export async function getOtherProfiles(): Promise<Tables<"profiles">[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not found");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .not("id", "eq", user.id);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
