"use server";

import { createClient } from "@/utils/supabase/server";
import { ErrorResponse } from "@/types/action.types";
import { GroupMember } from "@/stores/groupStore";
import { Tables, TablesInsert } from "@/types/db.types";

export async function createGroup({
  group,
  memberIds,
}: {
  group: TablesInsert<"group">;
  memberIds?: string[];
}): Promise<
  | ErrorResponse
  | {
      success: true;
      data: { group: Tables<"group">; groupMember: GroupMember[] };
      error: null;
    }
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: "User not found",
      success: false,
    };
  }

  const { data, error } = await supabase
    .from("group")
    .insert({ ...group, user_id: user.id })
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  const { error: groupMemberError } = await supabase
    .from("group_member")
    .insert({ group_id: data.id, user_id: user.id, status: "accepted" })
    .select()
    .single();

  if (groupMemberError) {
    return { success: false, data: null, error: groupMemberError.message };
  }

  if (memberIds) {
    const memberInsertData = memberIds.map((id) => ({
      group_id: data.id,
      user_id: id,
    }));
    const { error: memberError } = await supabase
      .from("group_member")
      .insert(memberInsertData);

    if (memberError) {
      return { success: false, data: null, error: memberError.message };
    }
  }

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .in("id", [user.id, ...(memberIds || [])]);

  if (profileError) {
    return { success: false, data: null, error: profileError.message };
  }

  const groupMember: GroupMember[] = profileData.map((profile) => ({
    member: profile,
    status: profile.id === user.id ? "accepted" : "pending",
  }));

  return {
    success: true,
    data: { group: data, groupMember },
    error: null,
  };
}
