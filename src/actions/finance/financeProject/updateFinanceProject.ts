"use server";

import { createClient } from "@/utils/supabase/server";
import { ApiResponseSingle } from "@/types/action.types";
import { StoreFinanceProject } from "@/types/finance.types";

export async function updateFinanceProject(
  oldProject: StoreFinanceProject,
  project: StoreFinanceProject
): Promise<ApiResponseSingle<StoreFinanceProject>> {
  const { categoryIds, adjustments, ...projectData } = project;

  const categoryIdsToDelete = oldProject.categoryIds.filter(
    (id) => !project.categoryIds.includes(id)
  );
  const categoryIdsToAdd = project.categoryIds.filter(
    (id) => !oldProject.categoryIds.includes(id)
  );

  const supabase = await createClient();

  const { error } = await supabase
    .from("finance_project")
    .update(projectData)
    .eq("id", project.id)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  const { error: categoryErrorDelete } = await supabase
    .from("finance_project_category")
    .delete()
    .eq("finance_project_id", project.id)
    .in("finance_category_id", categoryIdsToDelete);


  if (categoryErrorDelete) {
    return { success: false, data: null, error: categoryErrorDelete.message };
  }

  const { error: categoryErrorAdd } = await supabase
    .from("finance_project_category")
    .insert(
      categoryIdsToAdd.map((id) => ({
        finance_project_id: project.id,
        finance_category_id: id,
      }))
    );

  if (categoryErrorAdd) {
    return { success: false, data: null, error: categoryErrorAdd.message };
  }

  return { success: true, data: project, error: null };
}
