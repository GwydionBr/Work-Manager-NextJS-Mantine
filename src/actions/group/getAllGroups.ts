"use server";

import { createClient } from "@/utils/supabase/server";

import { Group } from "@/stores/groupStore";
import { ApiResponseList } from "@/types/action.types";

export async function getAllGroups(): Promise<ApiResponseList<Group>> {
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

  // Get all group tasks for the groups
  const { data: groupTaskData, error: groupTaskError } = await supabase
    .from("group_task")
    .select("*")
    .in(
      "group_id",
      groupData.map((group) => group.id)
    );

  if (groupTaskError) {
    return { success: false, data: null, error: groupTaskError.message };
  }

  const { data: recurringGroupTaskData, error: recurringGroupTaskError } =
    await supabase
      .from("recurring_group_task")
      .select("*")
      .in(
        "group_id",
        groupData.map((group) => group.id)
      );

  if (recurringGroupTaskError) {
    return {
      success: false,
      data: null,
      error: recurringGroupTaskError.message,
    };
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

  // Get all appointments for the groups
  const { data: appointmentData, error: appointmentError } = await supabase
    .from("group_appointment")
    .select("*")
    .in(
      "group_id",
      groupData.map((group) => group.id)
    );

  if (appointmentError) {
    return { success: false, data: null, error: appointmentError.message };
  }

  // Create a new array of group content with the combined data
  const allGroupContent: Group[] = [];

  for (const group of groupData) {
    const groupMembers = allMembers.filter(
      (member) => member.group_id === group.id
    );
    const groupProfiles = profileData
      .filter((profile) =>
        groupMembers.some((member) => member.user_id === profile.id)
      )
      .map((profile) => {
        const member = groupMembers.find(
          (member) => member.user_id === profile.id
        );
        return {
          ...profile,
          isAdmin: member?.is_Admin || false,
          color: member?.color || "#40c057",
          memberId: member?.id || "",
        };
      });

    allGroupContent.push({
      ...group,
      groceryItems: groceryData.filter(
        (grocery) => grocery.group_id === group.id
      ),
      members: groupProfiles.filter((profile) =>
        groupMembers.some(
          (member) =>
            member.user_id === profile.id && member.status === "accepted"
        )
      ),
      invitedMembers: groupProfiles.filter((profile) =>
        groupMembers.some(
          (member) =>
            member.user_id === profile.id && member.status === "pending"
        )
      ),
      groupTasks: groupTaskData.filter((task) => task.group_id === group.id),
      recurringGroupTasks: recurringGroupTaskData.filter(
        (task) => task.group_id === group.id
      ),
      appointments: appointmentData.filter(
        (appointment) => appointment.group_id === group.id
      ),
    });
  }
  return { success: true, data: allGroupContent, error: null };
}
