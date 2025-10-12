"use server";

import { createClient } from "@/utils/supabase/server";
import { InsertWorkTimeEntry, WorkTimeEntry } from "@/types/work.types";

export async function createWorkTimeEntries({
  sessions,
}: {
  sessions: InsertWorkTimeEntry[];
}): Promise<WorkTimeEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("timer_session")
    .insert(sessions)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
