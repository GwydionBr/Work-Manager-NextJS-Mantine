"use server";

import { ErrorResponse, SimpleResponse } from "@/types/action.types";
import { createClient } from "@/utils/supabase/server";
import { GroupMember } from "@/stores/groupStore";

export async function acceptGroupRequest({
  groupRequestId,
}: {
  groupRequestId: string;
}): Promise<ErrorResponse | { success: true; data: { groupMember: GroupMember; groupId: string }; error: null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("group_member")
    .update({ status: "accepted" })
    .eq("id", groupRequestId)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user_id)
    .single();

  if (profileError) {
    return { success: false, data: null, error: profileError.message };
  }

  const groupMember: GroupMember = {
    member: profileData,
    status: "accepted",
  };

  return { success: true, data: { groupMember, groupId: data.group_id }, error: null };
}

export async function declineGroupRequest({
  groupRequestId,
}: {
  groupRequestId: string;
}): Promise<SimpleResponse> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("group_member")
    .update({ status: "declined" })
    .eq("id", groupRequestId);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}