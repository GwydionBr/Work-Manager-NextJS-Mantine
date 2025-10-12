"use server";

import { createClient } from "@/utils/supabase/server";
import { Tables } from "@/types/db.types";

export async function getAllWorkFolders(): Promise<
  Tables<"timer_project_folder">[]
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not found");
  }

  const { data, error } = await supabase
    .from("timer_project_folder")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
