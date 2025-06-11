"use server";

import { createClient } from "@/utils/supabase/server";
import { ErrorResponse } from "@/types/action.types";
import { Tables, TablesInsert } from "@/types/db.types";
import { InvitedMember } from "@/stores/groupStore";

export async function createGroup({
  group,
  memberIds,
  color,
}: {
  group: TablesInsert<"group">;
  memberIds?: string[];
  color: null | string;
}): Promise<
  | ErrorResponse
  | {
      success: true;
      data: {
        group: Tables<"group">;
        admin: Tables<"profiles"> & { memberId: string };
        invitedMembers: InvitedMember[];
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

  const { data: groupMemberData, error: groupMemberError } = await supabase
    .from("group_member")
    .insert({
      group_id: data.id,
      user_id: user.id,
      status: "accepted",
      is_Admin: true,
      color: color || undefined,
    })
    .select()
    .single();

  if (groupMemberError) {
    return { success: false, data: null, error: groupMemberError.message };
  }

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .in("id", [user.id, ...(memberIds || [])]);

  if (profileError) {
    return { success: false, data: null, error: profileError.message };
  }

  let invitedMembers: InvitedMember[] = [];

  if (memberIds) {
    const memberInsertData = memberIds.map((id) => ({
      group_id: data.id,
      user_id: id,
    }));
    const { data: memberData, error: memberError } = await supabase
      .from("group_member")
      .insert(memberInsertData)
      .select();

    if (memberError) {
      return { success: false, data: null, error: memberError.message };
    }

    invitedMembers = profileData
      .filter((profile) => profile.id !== user.id)
      .map((profile) => {
        const member = memberData.find(
          (member) => member.user_id === profile.id
        );
        return {
          ...profile,
          memberId: member?.id || "",
        };
      });
  }

  const admin = profileData.find((profile) => profile.id === user.id);

  if (!admin) {
    return { success: false, data: null, error: "Admin not found" };
  }

  return {
    success: true,
    data: {
      group: data,
      invitedMembers,
      admin: { ...admin, memberId: groupMemberData.id },
    },
    error: null,
  };
}
