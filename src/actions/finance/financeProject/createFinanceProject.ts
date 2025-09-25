"use server";

import { createClient } from "@/utils/supabase/server";
import { ApiResponseSingle } from "@/types/action.types";
import { TablesInsert } from "@/types/db.types";
import { StoreFinanceProject } from "@/types/finance.types";

interface CreateFinanceProjectProps {
  project: TablesInsert<"finance_project">;
  categoryIds: string[];
}

export async function createFinanceProject({
  project,
  categoryIds,
}: CreateFinanceProjectProps): Promise<ApiResponseSingle<StoreFinanceProject>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("finance_project")
    .insert(project)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
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
    return { success: false, data: null, error: categoryError.message };
  }

  return {
    success: true,
    data: {
      ...data,
      categoryIds: categoryIds,
      adjustments: [],
    },
    error: null,
  };
}
