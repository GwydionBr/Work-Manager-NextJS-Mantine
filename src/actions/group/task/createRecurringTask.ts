"use server";

import { createClient } from "@/utils/supabase/server";
import { TablesInsert, Tables } from "@/types/db.types";

import { ApiResponseSingle } from "@/types/action.types";

export async function createRecurringGroupTask(
  task: TablesInsert<"recurring_group_task">
): Promise<ApiResponseSingle<Tables<"recurring_group_task">>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recurring_group_task")
    .insert(task)
    .select();

  if (error) {
    return { data: null, error: error.message, success: false };
  }

  return { data: data?.[0] || null, error: null, success: true };
}
