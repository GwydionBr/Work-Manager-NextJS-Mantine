"use server";

import { createClient } from "@/utils/supabase/server";
import { SimpleResponse } from "@/types/action.types";

interface DeleteTimerProjectsProps {
  projectIds: string[];
}

export async function deleteTimerProjects({
  projectIds,
}: DeleteTimerProjectsProps): Promise<SimpleResponse> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("timer_project")
    .delete()
    .in("id", projectIds);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}
