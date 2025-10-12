"use server";

import { createClient } from "@/utils/supabase/server";
import { InsertWorkProject, WorkProject } from "@/types/work.types";

interface CreateWorkProjectProps {
  project: InsertWorkProject;
}

export async function createWorkProject({
  project,
}: CreateWorkProjectProps): Promise<WorkProject> {
  const supabase = await createClient();

  const { categories, ...projectData } = project;

  const { data, error } = await supabase
    .from("timer_project")
    .insert(projectData)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const { data: categoriesData, error: categoryError } = await supabase
    .from("timer_project_category")
    .insert(
      categories.map((category) => ({
        timer_project_id: data.id,
        finance_category_id: category.id,
      }))
    ).select(`
      *,
      finance_category:finance_category_id(*)
    `);

  if (categoryError) {
    throw new Error(categoryError.message);
  }

  return {
    ...data,
    categories: categoriesData.map((category) => category.finance_category),
  };
}
