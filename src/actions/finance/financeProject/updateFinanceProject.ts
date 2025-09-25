"use server";

import { createClient } from "@/utils/supabase/server";
import { ApiResponseSingle } from "@/types/action.types";
import { StoreFinanceProject } from "@/types/finance.types";

export async function updateFinanceProject(
  oldProject: StoreFinanceProject,
  project: StoreFinanceProject
): Promise<ApiResponseSingle<StoreFinanceProject>> {
  const { categoryIds, clientIds, adjustments, ...projectData } = project;

  const clientIdsToDelete = oldProject.clientIds.filter(
    (id) => !project.clientIds.includes(id)
  );
  const categoryIdsToDelete = oldProject.categoryIds.filter(
    (id) => !project.categoryIds.includes(id)
  );
  const clientIdsToAdd = project.clientIds.filter(
    (id) => !oldProject.clientIds.includes(id)
  );
  const categoryIdsToAdd = project.categoryIds.filter(
    (id) => !oldProject.categoryIds.includes(id)
  );

  const supabase = await createClient();

  const { error } = await supabase
    .from("finance_project")
    .update(projectData)
    .eq("id", project.id!)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  const { error: clientErrorDelete } = await supabase
    .from("finance_project_client")
    .delete()
    .in("finance_client_id", clientIdsToDelete);

  if (clientErrorDelete) {
    return { success: false, data: null, error: clientErrorDelete.message };
  }

  const { error: categoryErrorDelete } = await supabase
    .from("finance_project_category")
    .delete()
    .in("finance_category_id", categoryIdsToDelete);

  if (categoryErrorDelete) {
    return { success: false, data: null, error: categoryErrorDelete.message };
  }

  const { error: clientErrorAdd } = await supabase
    .from("finance_project_client")
    .insert(
      clientIdsToAdd.map((id) => ({
        finance_project_id: project.id!,
        finance_client_id: id,
      }))
    );

  if (clientErrorAdd) {
    return { success: false, data: null, error: clientErrorAdd.message };
  }

  const { error: categoryErrorAdd } = await supabase
    .from("finance_project_category")
    .insert(
      categoryIdsToAdd.map((id) => ({
        finance_project_id: project.id!,
        finance_category_id: id,
      }))
    );

  if (categoryErrorAdd) {
    return { success: false, data: null, error: categoryErrorAdd.message };
  }

  return { success: true, data: project, error: null };
}
