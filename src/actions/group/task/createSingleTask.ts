"use server";

import { createClient } from "@/utils/supabase/server";
import { TablesInsert, Tables } from "@/types/db.types";

import { ApiResponseSingle } from "@/types/action.types";

export async function createSingleGroupTask(
  task: TablesInsert<"group_task">
): Promise<ApiResponseSingle<Tables<"group_task">>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("group_task")
    .insert(task)
    .select();

  if (error) {
    return { data: null, error: error.message, success: false };
  }

  return { data: data?.[0] || null, error: null, success: true };
}
