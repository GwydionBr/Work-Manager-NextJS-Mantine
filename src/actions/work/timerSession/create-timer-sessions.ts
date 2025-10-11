"use server";

import { createClient } from "@/utils/supabase/server";
import { TablesInsert, Tables } from "@/types/db.types";

export async function createSessions({
  sessions,
}: {
  sessions: TablesInsert<"timer_session">[];
}): Promise<Tables<"timer_session">[]> {
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
