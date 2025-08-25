import { createClient } from "@/utils/supabase/server";
import { ApiResponseList } from "@/types/action.types";

export async function getAllTasks(): Promise<ApiResponseList<"task">> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, data: null, error: "User not found" };
  }

  const { data, error } = await supabase
    .from("task")
    .select("*")
    .eq("user_id", user.id);
    
  if (error) {
    return { success: false, data: null, error: error.message };
  }
  return { success: true, data, error: null };
}
