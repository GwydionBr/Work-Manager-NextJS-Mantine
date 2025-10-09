"use server";

import { createClient } from "@/utils/supabase/server";
import { InsertFinanceProject, FinanceProject } from "@/types/finance.types";

interface CreateFinanceProjectProps {
  project: InsertFinanceProject;
}

export async function createFinanceProject({
  project,
}: CreateFinanceProjectProps): Promise<FinanceProject> {
  const supabase = await createClient();

  const { categories, client, ...projectData } = project;

  const { data, error } = await supabase
    .from("finance_project")
    .insert({ ...projectData, finance_client_id: client?.id || null })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const { error: categoryError } = await supabase
    .from("finance_project_category")
    .insert(
      categories.map((category) => ({
        finance_project_id: data.id,
        finance_category_id: category.finance_category.id,
      }))
    );

  if (categoryError) {
    throw new Error(categoryError.message);
  }

  return {
    ...data,
    finance_client: client,
    categories: categories,
    adjustments: [],
  };
}
