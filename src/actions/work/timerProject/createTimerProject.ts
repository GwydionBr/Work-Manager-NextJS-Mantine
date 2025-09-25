"use server";

import { createClient } from "@/utils/supabase/server";
import { TablesInsert } from "@/types/db.types";
import { StoreTimerProject } from "@/types/work.types";
import { ApiResponseSingle } from "@/types/action.types";

interface CreateTimerProjectProps {
  project: TablesInsert<"timer_project">;
  categoryIds: string[];
}

export async function createTimerProject({
  project,
  categoryIds,
}: CreateTimerProjectProps): Promise<ApiResponseSingle<StoreTimerProject>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("timer_project")
    .insert(project)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  const { error: categoryError } = await supabase
    .from("timer_project_category")
    .insert(
      categoryIds.map((id) => ({
        timer_project_id: data.id,
        finance_category_id: id,
      }))
    )
    .select();

  if (categoryError) {
    return { success: false, data: null, error: categoryError.message };
  }

  return { success: true, data: { ...data, categoryIds }, error: null };
}
