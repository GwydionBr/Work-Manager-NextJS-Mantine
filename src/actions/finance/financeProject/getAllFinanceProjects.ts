"use server";

import { createClient } from "@/utils/supabase/server";
import { ErrorResponse } from "@/types/action.types";
import { FinanceProject } from "@/types/finance.types";

export async function getAllFinanceProjects(): Promise<
  | {
      success: true;
      data: FinanceProject[];
      error: null;
    }
  | ErrorResponse
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, data: null, error: "User not found" };
  }

  const { data, error } = await supabase
    .from("finance_project")
    .select(
      `
      *,
      adjustments:finance_project_adjustment(*),
      clients:finance_project_client(
        finance_client:finance_client_id(*)
      ),
      categories:finance_project_category(
        finance_category:finance_category_id(*)
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  if (!data || data.length === 0) {
    return { success: true, data: [], error: null };
  }

  // Transform the data to match the expected structure
  const formatted: FinanceProject[] = data.map((project) => ({
    ...project,
    adjustments: project.adjustments || [],
    clients:
      project.clients?.map((c: any) => c.finance_client).filter(Boolean) || [],
    categories:
      project.categories?.map((c: any) => c.finance_category).filter(Boolean) ||
      [],
  }));

  return { success: true, data: formatted, error: null };
}
