"use server";

import { createClient } from "@/utils/supabase/server";
import { UpdateWorkTimeEntry, WorkTimeEntry } from "@/types/work.types";

export async function updateWorkTimeEntries({
  sessionIds,
  update,
}: {
  sessionIds: string[];
  update: UpdateWorkTimeEntry;
}): Promise<WorkTimeEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("timer_session")
    .update(update)
    .in("id", sessionIds)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}
