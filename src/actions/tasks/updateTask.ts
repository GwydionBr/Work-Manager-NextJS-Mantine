import { createClient } from "@/utils/supabase/server";
import { ApiResponseSingle } from "@/types/action.types";
import { TablesUpdate } from "@/types/db.types";

export async function updateTask(task: TablesUpdate<"task">): Promise<ApiResponseSingle<"task">> {
  const supabase = await createClient();
 
  if (!task.id) {
    return { success: false, data: null, error: "Task id is required" };
  }

  const { data, error } = await supabase
    .from("task")
    .update(task)
    .eq("id", task.id)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }
  return { success: true, data, error: null };
}
