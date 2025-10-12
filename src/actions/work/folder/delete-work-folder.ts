"use server";

import { createClient } from "@/utils/supabase/server";

export async function deleteWorkFolder({
  folderIds,
}: {
  folderIds: string[];
}): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("timer_project_folder")
    .delete()
    .in("id", folderIds);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}
