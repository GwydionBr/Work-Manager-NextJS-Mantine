"use server";

import { createClient } from "@/utils/supabase/server";
import { SimpleResponse } from "@/types/action.types";
import { TablesUpdate } from "@/types/db.types";

export async function updateGroupMember(
  member: TablesUpdate<"group_member">
): Promise<SimpleResponse> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("group_member")
    .update(member)
    .eq("user_id", member.user_id!)
    .eq("group_id", member.group_id!);

  if (error) {
    return { success: false, error: error.message, data: null };
  }
  return { success: true, error: null, data: null };
}
