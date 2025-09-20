"use server";

import { createClient } from "@/utils/supabase/server";

import { ApiResponseSingle } from "@/types/action.types";
import { Enums, Tables } from "@/types/db.types";

export async function insertGroupMembers(
  groupId: string,
  memberIds: string[]
): Promise<ApiResponseSingle<(Tables<"profiles"> & { memberId: string })[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
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

  const dataWithMemberId = profileData.map((profile) => ({
    ...profile,
    memberId: data.find((d) => d.user_id === profile.id)?.id || "",
  }));

  return { success: true, data: dataWithMemberId, error: null };
}
