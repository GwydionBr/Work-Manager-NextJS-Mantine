"use server";

import { createClient } from "@/utils/supabase/server";

import { Tables, TablesInsert } from "@/types/db.types";
import {
  ApiResponseSingle,
  DeleteResponse,
  ErrorResponse,
} from "@/types/action.types";
import { Friend } from "@/stores/profileStore";

export async function getAllFriendships(): Promise<
  | ErrorResponse
  | {
      success: true;
      data: Friend[];
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
    .from("friendships")
    .select("*")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  const friendsData = data.map((friendship) =>
    friendship.requester_id === user.id
      ? {
          id: friendship.addressee_id,
          status: friendship.status,
          requester: true,
        }
      : {
          id: friendship.requester_id,
          status: friendship.status,
          requester: false,
        }
  );

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .in(
      "id",
      friendsData.map((friend) => friend.id)
    );

  if (profilesError) {
    return { success: false, data: null, error: profilesError.message };
  }

  const friends = friendsData.map((friend) => ({
    ...friend,
    profile: profiles.find(
      (profile) => profile.id === friend.id
    ) as Tables<"profiles">,
  }));

  return { success: true, data: friends, error: null };
}

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
}): Promise<ApiResponseSingle<"friendships">> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("friendships")
    .update({ status: "accepted" })
    .eq("id", friendshipId)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function declineFriendship({
  friendshipId,
}: {
  friendshipId: string;
}): Promise<ApiResponseSingle<"friendships">> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("friendships")
    .update({ status: "declined" })
    .eq("id", friendshipId)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

export async function deleteFriendship({
  friendshipId,
}: {
  friendshipId: string;
}): Promise<DeleteResponse> {
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
