"use server";

import { createClient } from "@/utils/supabase/server";

export async function deleteWorkTimeEntries({
  ids,
}: {
  ids: string[];
}): Promise<{ project_id: string }> {
  const supabase = await createClient();

  const { data, error: projectIdError } = await supabase
    .from("timer_session")
    .select("project_id")
    .in("id", ids);

  if (projectIdError || data.length === 0) {
    throw new Error(projectIdError?.message || "Project ID not found");
  }

  const { error: deleteError } = await supabase
    .from("timer_session")
    .delete()
    .in("id", ids);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  return data[0];
}
