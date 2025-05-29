"use server";

import { createClient } from "@/utils/supabase/server";

import { ApiResponseList } from "@/types/action.types";
import { Enums } from "@/types/db.types";

export async function insertGroupMembers(
  groupId: string,
  memberIds: string[]
): Promise<ApiResponseList<"profiles">> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("group_member")
    .insert(
      memberIds.map((id) => ({
        group_id: groupId,
        user_id: id,
        status: "pending" as Enums<"status">,
      }))
    )
    .select();

  if (error) {
    return {
      success: false,
      data: null,
      error: "updateGroupMembers error: " + error.message,
    };
  }

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .in("id", memberIds);

  if (profileError) {
    return {
      success: false,
      data: null,
      error: "insertGroupMembers error: " + profileError.message,
    };
  }

  return { success: true, data: profileData, error: null };
}
