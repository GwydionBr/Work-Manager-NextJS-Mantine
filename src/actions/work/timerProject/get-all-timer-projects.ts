"use server";

import { createClient } from "@/utils/supabase/server";
import { TimerProject } from "@/types/work.types";

export async function getAllTimerProjects(): Promise<TimerProject[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not found");
  }

  const { data, error } = await supabase
    .from("timer_project")
    .select(
      `
      *,
      categories:timer_project_category(
        finance_category:finance_category_id(*)
      ),
      sessions:timer_session(*)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data.map((project) => ({
    ...project,
    categories: project.categories.map((category) => category.finance_category),
    sessions: project.sessions,
  }));
}
