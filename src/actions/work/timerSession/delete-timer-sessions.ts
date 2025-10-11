"use server";

import { createClient } from "@/utils/supabase/server";

export async function deleteTimerSessions({
  sessionIds,
}: {
  sessionIds: string[];
}): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("timer_session")
    .delete()
    .in("id", sessionIds);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}
