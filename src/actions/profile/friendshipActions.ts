"use server";

import { createClient } from "@/utils/supabase/server";

import { TablesInsert } from "@/types/db.types";
import {
  ApiResponseSingle,
  SimpleResponse,
} from "@/types/action.types";

export async function createFriendship({
  friendship,
}: {
  friendship: TablesInsert<"friendships">;
}): Promise<ApiResponseSingle<"friendships">> {
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
    .from("friendships")
    .insert({ ...friendship, requester_id: user.id })
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function acceptFriendship({
  friendshipId,
}: {
  friendshipId: string;
}): Promise<SimpleResponse> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("friendships")
    .update({ status: "accepted" })
    .eq("id", friendshipId)
    .select();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}

export async function declineFriendship({
  friendshipId,
}: {
  friendshipId: string;
}): Promise<SimpleResponse> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("friendships")
    .update({ status: "declined" })
    .eq("id", friendshipId);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}

export async function deleteFriendship({
  friendshipId,
}: {
  friendshipId: string;
}): Promise<SimpleResponse> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}
