"use server";

import { SimpleResponse } from "@/types/action.types";
import { createClient } from "@/utils/supabase/server";

export async function acceptGroupRequest({
  groupRequestId,
}: {
  groupRequestId: string;
}): Promise<SimpleResponse> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("group_member")
    .update({ status: "accepted" })
    .eq("id", groupRequestId)
    .select();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
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