"use server";

import { createClient } from "@/utils/supabase/server";
import { Tables, TablesInsert } from "@/types/db.types";
import {
  ApiResponseList,
  ApiResponseSingle,
  DeleteResponse,
  ErrorResponse
} from "@/types/action.types";

export async function getAllFriendships(): Promise<
  ErrorResponse | {
    success: true;
    data: {
      friends: Tables<"profiles">[];
      pendingFriends: Tables<"profiles">[];
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
    .from("friendships")
    .select("*")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  const pendingFriendships = data.filter(
    (friendship) => friendship.status === "pending"
  );

  const pendingFriendIds = pendingFriendships.map((friendship) =>
    friendship.requester_id === user.id
      ? friendship.addressee_id
      : friendship.requester_id
  );

  const friendships = data.filter(  
    (friendship) => friendship.status === "accepted"
  );

  const friendIds = friendships.map((friendship) =>
    friendship.requester_id === user.id
      ? friendship.addressee_id
      : friendship.requester_id
  );

  const { data: friends, error: friendsError } = await supabase
    .from("profiles")
    .select("*")
    .in("id", friendIds);

  const { data: pendingFriends, error: pendingFriendsError } = await supabase
    .from("profiles")
    .select("*")
    .in("id", pendingFriendIds);

  if (friendsError || pendingFriendsError) {
    return { success: false, data: null, error: friendsError?.message || pendingFriendsError?.message || "Unknown error" };
  }

  return { success: true, data: { friends, pendingFriends }, error: null };
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
