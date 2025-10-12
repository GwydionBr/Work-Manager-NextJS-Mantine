"use server";

import { Tables, TablesUpdate } from "@/types/db.types";
import { createClient } from "@/utils/supabase/server";

export async function updateWorkFolder({
  folder,
}: {
  folder: TablesUpdate<"timer_project_folder">;
}): Promise<Tables<"timer_project_folder">> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("timer_project_folder")
    .update(folder)
    .eq("id", folder.id!)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
