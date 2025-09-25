"use server";

import { createClient } from "@/utils/supabase/server";
import { TablesUpdate } from "@/types/db.types";
import { SimpleResponse, UpdateManyToMany } from "@/types/action.types";

interface UpdateTimerProjectProps {
  project: TablesUpdate<"timer_project">;
  categoryUpdates: UpdateManyToMany;
}

export async function updateTimerProject({
  project,
  categoryUpdates,
}: UpdateTimerProjectProps): Promise<SimpleResponse> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("timer_project")
    .update(project)
    .eq("id", project.id!)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  if (categoryUpdates.deleteIds.length > 0) {
    const { error: categoryErrorDelete } = await supabase
      .from("timer_project_category")
      .delete()
      .in("id", categoryUpdates.deleteIds);

    if (categoryErrorDelete) {
      return { success: false, data: null, error: categoryErrorDelete.message };
    }
  }

  if (categoryUpdates.addIds.length > 0) {
    const { error: categoryErrorAdd } = await supabase
      .from("timer_project_category")
      .insert(
        categoryUpdates.addIds.map((id) => ({
          timer_project_id: data.id,
          finance_category_id: id,
        }))
      )
      .select();

    if (categoryErrorAdd) {
      return { success: false, data: null, error: categoryErrorAdd.message };
    }
  }

  return { success: true, data: null, error: null };
}
