"use server";

import { createClient } from "@/utils/supabase/server";
import { FinanceProject } from "@/types/finance.types";

export async function getAllFinanceProjects(){
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("finance_project")
    .select(
      `
      *,
      adjustments:finance_project_adjustment(*),
      categories:finance_project_category(
        finance_category:finance_category_id(*)
      ),
      finance_client:finance_client_id(*)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as FinanceProject[];
}
