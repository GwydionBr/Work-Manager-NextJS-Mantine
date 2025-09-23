"use server";

import { createClient } from "@/utils/supabase/server";
import { ApiResponseSingle } from "@/types/action.types";
import { TablesInsert } from "@/types/db.types";
import { FetchedFinanceProject } from "@/types/finance.types";

interface CreateFinanceProjectProps {
  project: TablesInsert<"finance_project">;
  clientIds: string[];
  categoryIds: string[];
}

export async function createFinanceProject({
  project,
  clientIds,
  categoryIds,
}: CreateFinanceProjectProps): Promise<
  ApiResponseSingle<FetchedFinanceProject>
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("finance_project")
    .insert(project)
    .select()
    .single();

  if (error) {
    console.log(project);
    console.log(error);
    return { success: false, data: null, error: error.message };
  }

  const { error: clientError } = await supabase
    .from("finance_project_client")
    .insert(
      clientIds.map((id) => ({
        finance_project_id: data.id,
        finance_client_id: id,
      }))
    )
    .select();

  if (clientError) {
    console.log(clientError);
    return { success: false, data: null, error: clientError.message };
  }

  const { error: categoryError } = await supabase
    .from("finance_project_category")
    .insert(
      categoryIds.map((id) => ({
        finance_project_id: data.id,
        finance_category_id: id,
      }))
    )
    .select();

  if (categoryError) {
    console.log(categoryError);
    return { success: false, data: null, error: categoryError.message };
  }

  return {
    success: true,
    data: {
      ...data,
      clientIds: clientIds,
      categoryIds: categoryIds,
      adjustments: [],
    },
    error: null,
  };
}
