"use server";

import { createClient } from "@/utils/supabase/server";

interface DeleteTimerProjectsProps {
  projectIds: string[];
}

export async function deleteTimerProjects({
  projectIds,
}: DeleteTimerProjectsProps): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("timer_project")
    .delete()
    .in("id", projectIds);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}
