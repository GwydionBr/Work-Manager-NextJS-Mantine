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

  const { data: projects, error } = await supabase
    .from("finance_project")
    .select("*")
    .eq("user_id", user.id)
    .order("title", { ascending: true });

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  const { data: adjustments, error: adjustmentsError } = await supabase
    .from("finance_project_adjustment")
    .select("*")
    .eq("user_id", user.id);

  if (adjustmentsError) {
    return { success: false, data: null, error: adjustmentsError.message };
  }

  const data = projects.map((project) => ({
    ...project,
    adjustments: adjustments.filter(
      (adjustment) => adjustment.finance_project_id === project.id
    ),
  }));

  return { success: true, data, error: null };
}
