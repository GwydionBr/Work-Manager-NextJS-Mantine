"use server";

import { createClient } from "@/utils/supabase/server";
import { ApiResponseList } from "@/types/action.types";
import { StoreTimerProject } from "@/types/work.types";

export async function getAllTimerProjects(): Promise<
  ApiResponseList<StoreTimerProject>
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: "User not found",
      success: false,
    };
  }

  const { data, error } = await supabase
    .from("timer_project")
    .select(
      `
      *,
      categories:timer_project_category(
        finance_category:finance_category_id(*)
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  const formatted: StoreTimerProject[] = data.map((project) => {
    const { categories, ...rest } = project;
    return {
      ...rest,
      categoryIds: categories.map((category) => category.finance_category.id),
    };
  });

  return { success: true, data: formatted, error: null };
}
