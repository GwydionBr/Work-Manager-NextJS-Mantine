"use server";

import { createClient } from "@/utils/supabase/server";
import { Group } from "@/stores/groupStore";
import { ErrorResponse } from "@/types/action.types";

export async function getGroupById(groupId: string): Promise<
  | ErrorResponse
  | {
      success: true;
      data: Group;
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

  // Get the group
  const { data: groupData, error: groupError } = await supabase
    .from("group")
    .select("*")
    .eq("id", groupId)
    .single();

  if (groupError) {
    return { success: false, data: null, error: groupError.message };
  }

  if (!groupData) {
    return { success: false, data: null, error: "Group not found" };
  }

  // Get all grocery items for the group
  const { data: groceryData, error: groceryError } = await supabase
    .from("grocery_item")
    .select("*")
    .eq("group_id", groupId);

  if (groceryError) {
    return { success: false, data: null, error: groceryError.message };
  }

  // Get all group tasks for the group
  const { data: groupTaskData, error: groupTaskError } = await supabase
    .from("group_task")
    .select("*")
    .eq("group_id", groupId);

  if (groupTaskError) {
    return { success: false, data: null, error: groupTaskError.message };
  }

  // Get all recurring group tasks for the group
  const { data: recurringGroupTaskData, error: recurringGroupTaskError } =
    await supabase
      .from("recurring_group_task")
      .select("*")
      .eq("group_id", groupId);

  if (recurringGroupTaskError) {
    return {
      success: false,
      data: null,
      error: recurringGroupTaskError.message,
    };
  }

  // Get all members for the group
  const { data: allMembers, error: allMembersError } = await supabase
    .from("group_member")
    .select("*")
    .eq("group_id", groupId);

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

  // Get all appointments for the group
  const { data: appointmentData, error: appointmentError } = await supabase
    .from("group_appointment")
    .select("*")
    .eq("group_id", groupId);

  if (appointmentError) {
    return { success: false, data: null, error: appointmentError.message };
  }

  // Create the group content with the combined data
  const groupContent: Group = {
    ...groupData,
    groceryItems: groceryData,
    members: profileData
      .filter((profile) =>
        allMembers.some(
          (member) =>
            member.user_id === profile.id && member.status === "accepted"
        )
      )
      .map((profile) => {
        const member = allMembers.find(
          (member) => member.user_id === profile.id
        );
        return {
          ...profile,
          isAdmin: member?.is_Admin || false,
          color: member?.color || "#40c057",
          memberId: member?.id || "",
        };
      }),
    invitedMembers: profileData
      .filter((profile) =>
        allMembers.some(
          (member) =>
            member.user_id === profile.id && member.status === "pending"
        )
      )
      .map((profile) => {
        const member = allMembers.find(
          (member) => member.user_id === profile.id
        );
        return {
          ...profile,
          memberId: member?.id || "",
        };
      }),
    appointments: appointmentData,
    groupTasks: groupTaskData,
    recurringGroupTasks: recurringGroupTaskData,
  };

  return { success: true, data: groupContent, error: null };
}
