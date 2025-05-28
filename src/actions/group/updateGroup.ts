"use server";

import { createClient } from "@/utils/supabase/server";
import { ErrorResponse } from "@/types/action.types";
import { Enums, Tables, TablesUpdate } from "@/types/db.types";
import { GroupMember } from "@/stores/groupStore";

export async function updateGroup({
  group,
  memberIds,
}: {
  group: TablesUpdate<"group">;
  memberIds?: string[];
}): Promise<
  ErrorResponse | { success: true; data: { group: Tables<"group">; groupMember: GroupMember[] | null }; error: null }
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("group")
    .update(group)
    .eq("id", group.id!)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  if (memberIds) {
    const memberInsertData = memberIds.map((id) => ({
      group_id: group.id!,
      user_id: id,
      status: "pending" as Enums<"status">,
    }));
    const { error: memberError } = await supabase
      .from("group_member")
      .insert(memberInsertData);

    if (memberError) {
      return { success: false, data: null, error: memberError.message };
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .in("id", [...memberIds]);

    if (profileError) {
      return { success: false, data: null, error: profileError.message };
    }

    const groupMember: GroupMember[] = profileData.map((profile) => ({
      member: profile,
      status: "pending",
    }));

    return { success: true, data: { group: data, groupMember }, error: null };
  }

  return { success: true, data: { group: data, groupMember: null }, error: null };
}
