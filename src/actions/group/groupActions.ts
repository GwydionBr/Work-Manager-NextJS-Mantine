"use server";

import { createClient } from "@/utils/supabase/server";
import { TablesInsert, TablesUpdate } from "@/types/db.types";
import {
  ApiResponseSingle,
  SimpleResponse,
} from "@/types/action.types";

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

export async function createGroup({
  group,
  memberIds,
}: {
  group: TablesInsert<"group">;
  memberIds?: string[];
}): Promise<ApiResponseSingle<"group">> {
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
  
  return { success: true, data, error: null };
}

export async function updateGroup({
  group,
}: {
  group: TablesUpdate<"group">;
}): Promise<ApiResponseSingle<"group">> {
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
