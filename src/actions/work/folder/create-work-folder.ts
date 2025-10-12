"use server";

import { Tables, TablesInsert } from "@/types/db.types";
import { createClient } from "@/utils/supabase/server";

export async function createWorkFolder({
  folder,
}: {
  folder: TablesInsert<"timer_project_folder">;
}): Promise<Tables<"timer_project_folder">> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("timer_project_folder")
    .insert(folder)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
