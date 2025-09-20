"use server";

import { ApiResponseSingle, SimpleResponse } from "@/types/action.types";
import { createClient } from "@/utils/supabase/server";

import { Tables } from "@/types/db.types";

export async function acceptGroupRequest({
  groupRequestId,
  color,
}: {
  groupRequestId: string;
  color: null | string;
}): Promise<
  ApiResponseSingle<{ groupMember: Tables<"profiles">; groupId: string }>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("group_member")
    .update({ status: "accepted", color: color || undefined })
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
  return {
    success: true,
    data: { groupMember: profileData, groupId: data.group_id },
    error: null,
  };
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
