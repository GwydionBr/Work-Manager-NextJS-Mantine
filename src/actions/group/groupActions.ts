"use server";

import { createClient } from "@/utils/supabase/server";
import { TablesUpdate } from "@/types/db.types";
import { ApiResponseSingle, SimpleResponse } from "@/types/action.types";

export async function getGroupById({
  groupId,
}: {
  groupId: string;
}): Promise<ApiResponseSingle<"group">> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("group")
    .select("*")
    .eq("id", groupId)
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}



export async function deleteGroup({
  groupId,
}: {
  groupId: string;
}): Promise<SimpleResponse> {
  const supabase = await createClient();
  const { error } = await supabase.from("group").delete().eq("id", groupId);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}
