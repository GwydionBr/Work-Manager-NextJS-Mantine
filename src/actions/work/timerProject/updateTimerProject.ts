"use server";

import { createClient } from "@/utils/supabase/server";
import { TablesUpdate } from "@/types/db.types";
import { ApiResponseSingle, UpdateManyToMany } from "@/types/action.types";
import { StoreTimerProject } from "@/types/work.types";

interface UpdateTimerProjectProps {
  project: TablesUpdate<"timer_project">;
  categoryUpdates: UpdateManyToMany;
  categoryIds: string[];
}

export async function updateTimerProject({
  project,
  categoryUpdates,
  categoryIds,
}: UpdateTimerProjectProps): Promise<ApiResponseSingle<StoreTimerProject>> {
  const supabase = await createClient();

  // Update the project
  const { data, error } = await supabase
    .from("timer_project")
    .update(project)
    .eq("id", project.id!)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  // Delete the categories
  if (categoryUpdates.deleteIds.length > 0) {
    const { error: categoryErrorDelete } = await supabase
      .from("timer_project_category")
      .delete()
      .eq("timer_project_id", data.id)
      .in("finance_category_id", categoryUpdates.deleteIds);

    if (categoryErrorDelete) {
      return { success: false, data: null, error: categoryErrorDelete.message };
    }
  }

  // Add the categories
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

  // Update the categoryIds
  let newCategoryIds = categoryIds;
  // Delete the categories
  if (categoryUpdates.deleteIds.length > 0) {
    newCategoryIds = newCategoryIds.filter(
      (id) => !categoryUpdates.deleteIds.includes(id)
    );
  }
  // Add the categories
  if (categoryUpdates.addIds.length > 0) {
    newCategoryIds = [...newCategoryIds, ...categoryUpdates.addIds];
  }

  const newProject = { ...data, categoryIds: newCategoryIds };

  return { success: true, data: newProject, error: null };
}
