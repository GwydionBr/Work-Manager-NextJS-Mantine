"use server";

import { createClient } from "@/utils/supabase/server";

import { Group } from "@/stores/groupStore";
import { ErrorResponse } from "@/types/action.types";

export async function getAllGroups(): Promise<
  | ErrorResponse
  | {
      success: true;
      data: Group[];
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

  // Get all group relations for the user
  const { data: memberData, error: memberError } = await supabase
    .from("group_member")
    .select("*")
    .eq("user_id", user.id);

  if (memberError) {
    return { success: false, data: null, error: memberError.message };
  }

  // Get all groups the user is a member of
  const { data: groupData, error: groupError } = await supabase
    .from("group")
    .select("*")
    .in(
      "id",
      memberData
        .filter((member) => member.status === "accepted")
        .map((member) => member.group_id)
    );

  if (groupError) {
    return { success: false, data: null, error: groupError.message };
  }

  // Get all grocery items for the groups
  const { data: groceryData, error: groceryError } = await supabase
    .from("grocery_item")
    .select("*")
    .in(
      "group_id",
      groupData.map((group) => group.id)
    );

  if (groceryError) {
    return { success: false, data: null, error: groceryError.message };
  }

  // Get all members for the groups
  const { data: allMembers, error: allMembersError } = await supabase
    .from("group_member")
    .select("*")
    .in(
      "group_id",
      groupData.map((group) => group.id)
    );

  if (allMembersError) {
    return { success: false, data: null, error: allMembersError.message };
  }

  // Get all profiles for the members
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .in(
      "id",
      allMembers.map((member) => member.user_id)
    );

  if (profileError) {
    return { success: false, data: null, error: profileError.message };
  }

  // Create a new array of group content with the combined data
  const allGroupContent: Group[] = [];

  for (const group of groupData) {
    const groupMembers = allMembers.filter(
      (member) => member.group_id === group.id
    );
    const groupProfiles = profileData.filter((profile) =>
      groupMembers.some((member) => member.user_id === profile.id)
    );

    allGroupContent.push({
      ...group,
      groceryItems: groceryData.filter(
        (grocery) => grocery.group_id === group.id
      ),
      admins: groupProfiles.filter((profile) =>
        groupMembers.some(
          (member) =>
            member.user_id === profile.id &&
            member.is_Admin &&
            member.status === "accepted"
        )
      ),
      members: groupProfiles.filter((profile) =>
        groupMembers.some(
          (member) =>
            member.user_id === profile.id &&
            !member.is_Admin &&
            member.status === "accepted"
        )
      ),
      invitedMemebers: groupProfiles.filter((profile) =>
        groupMembers.some(
          (member) =>
            member.user_id === profile.id && member.status === "pending"
        )
      ),
    });
  }
  return { success: true, data: allGroupContent, error: null };
}
