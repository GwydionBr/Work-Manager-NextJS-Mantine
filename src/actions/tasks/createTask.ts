"use server";

import { createClient } from "@/utils/supabase/server";
import { ApiResponseSingle } from "@/types/action.types";
import { TablesInsert, Tables } from "@/types/db.types";

export async function createTask(
  task: TablesInsert<"task">
): Promise<ApiResponseSingle<Tables<"task">>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("task")
    .insert(task)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }
  return { success: true, data, error: null };
}
