"use server";

import { createClient } from "@/utils/supabase/server";

import { ErrorResponse } from "@/types/action.types";
import { FriendRequest } from "@/stores/userStore";

export async function getFriendRequests(): Promise<
  | ErrorResponse
  | {
      success: true;
      data: {
        friendRequests: FriendRequest[];
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

  const { data: friendshipData, error: friendshipError } = await supabase
    .from("friendships")
    .select("*")
    .eq("status", "pending")
    .eq("addressee_id", user.id);

  if (friendshipError) {
    return {
      success: false,
      data: null,
      error: friendshipError.message,
    };
  }

  const { data: friendsData, error: friendsError } = await supabase
    .from("profiles")
    .select("*")
    .in(
      "id",
      friendshipData.map((friendship) => friendship.requester_id)
    );

  if (friendsError) {
    return {
      success: false,
      data: null,
      error: friendsError.message,
    };
  }

  const friendRequests = friendshipData.map((friendship) => {
    const friend = friendsData.find(
      (friend) => friend.id === friendship.requester_id
    );
    return {
      requestId: friendship.id,
      name: friend?.username || "No friend name",
      email: friend?.email || "No friend email",
      avatar: friend?.avatar_url || null,
      createdAt: friendship.created_at,
    };
  });

  return {
    success: true,
    error: null,
    data: {
      friendRequests,
    },
  };
}
