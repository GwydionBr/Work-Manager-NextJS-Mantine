"use server";

import { createClient } from "@/utils/supabase/server";
import { WorkTimeEntry } from "@/types/work.types";

export async function getWorkTimeEntriesByProjectId({
  projectId,
}: {
  projectId: string;
}): Promise<WorkTimeEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("timer_session")
    .select(`*`)
    .eq("project_id", projectId);

  if (error) {
    throw new Error(error.message);
  }
  return data;
}
