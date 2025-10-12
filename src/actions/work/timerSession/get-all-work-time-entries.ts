"use server";

import { WorkTimeEntry } from "@/types/work.types";
import { createClient } from "@/utils/supabase/server";

export async function getAllWorkTimeEntries(): Promise<WorkTimeEntry[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not found");
  }

  const { data, error } = await supabase
    .from("timer_session")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
