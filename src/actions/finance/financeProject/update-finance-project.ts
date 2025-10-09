"use server";

import { createClient } from "@/utils/supabase/server";
import { FinanceProject, UpdateFinanceProject } from "@/types/finance.types";

export async function updateFinanceProject(
  project: UpdateFinanceProject
): Promise<FinanceProject> {
  const { categories, finance_client, adjustments, ...projectData } = project;

  const supabase = await createClient();

  if (!project.id) {
    throw new Error("Project id is required");
  }

  const projectId = project.id;

  const { data, error } = await supabase
    .from("finance_project")
    .update(projectData)
    .eq("id", projectId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const { error: categoryErrorDelete } = await supabase
    .from("finance_project_category")
    .delete()
    .eq("finance_project_id", projectId);

  if (categoryErrorDelete) {
    throw new Error(categoryErrorDelete.message);
  }

  const { error: categoryErrorAdd } = await supabase
    .from("finance_project_category")
    .insert(
      categories.map((category) => ({
        finance_project_id: projectId,
        finance_category_id: category.finance_category.id,
      }))
    );

  if (categoryErrorAdd) {
    throw new Error(categoryErrorAdd.message);
  }

  return { ...data, categories, finance_client, adjustments };
}
