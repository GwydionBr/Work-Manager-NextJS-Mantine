"use server";

import { createClient } from "@/utils/supabase/server";
import { TablesInsert, TablesUpdate } from "@/types/db.types";
import {
  ApiResponseList,
  ApiResponseSingle,
  SimpleResponse,
} from "@/types/action.types";

export async function getAllGroups(): Promise<ApiResponseList<"group">> {
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
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

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
}: {
  group: TablesInsert<"group">;
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
