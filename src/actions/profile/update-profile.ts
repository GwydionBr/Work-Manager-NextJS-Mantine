"use server";

import { createClient } from "@/utils/supabase/server";
import { TablesUpdate, Tables } from "@/types/db.types";

export async function updateProfile({
  profile,
}: {
  profile: TablesUpdate<"profiles">;
}): Promise<Tables<"profiles">> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update(profile)
    .eq("id", profile.id!)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
