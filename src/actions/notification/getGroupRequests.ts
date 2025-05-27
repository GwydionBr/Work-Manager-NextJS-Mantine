"use server";

import { createClient } from "@/utils/supabase/server";
import { ErrorResponse } from "@/types/action.types";
import { GroupRequest } from "@/stores/groupStore";

export async function getGroupRequests(): Promise<
  | ErrorResponse
  | {
      success: true;
      data: {
        groupRequests: GroupRequest[];
      };
      error: null;
    }
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      data: null,
      error: "User not found",
    };
  }

  const { data: groupMemberData, error: groupMemberError } = await supabase
    .from("group_member")
    .select("*")
    .eq("status", "pending")
    .eq("user_id", user.id);

  if (groupMemberError) {
    return {
      success: false,
      data: null,
      error: groupMemberError.message,
    };
  }

  const { data: groupsData, error: groupsError } = await supabase
    .from("group")
    .select("*")
    .in(
      "id",
      groupMemberData.map((member) => member.group_id)
    );

  if (groupsError) {
    return {
      success: false,
      data: null,
      error: groupsError.message,
    };
  }

  const groupRequests = groupMemberData.map((member) => {
    const group = groupsData.find((group) => group.id === member.group_id);
    return {
      requestId: member.id,
      name: group?.title || "No group name",
      description: group?.description || undefined,
      createdAt: member.created_at,
    };
  });

  return {
    success: true,
    error: null,
    data: {
      groupRequests,
    },
  };
}
