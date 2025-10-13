"use server";

import { createClient } from "@/utils/supabase/server";

export async function deleteWorkTimeEntries({
  ids,
}: {
  ids: string[];
}): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.from("timer_session").delete().in("id", ids);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}
