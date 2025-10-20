"use server";

import { createClient } from "@/utils/supabase/server";
import { WorkProject } from "@/types/work.types";

export async function getWorkProjectById({
  projectId,
}: {
  projectId: string;
}): Promise<WorkProject> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("timer_project")
    .select(
      `* , categories:timer_project_category(finance_category:finance_category_id(*))`
    )
    .eq("id", projectId)
    .single();
    
  if (error) {
    throw new Error(error.message);
  }
  return {
    ...data,
    categories: data.categories.map((category) => category.finance_category),
  };
}
