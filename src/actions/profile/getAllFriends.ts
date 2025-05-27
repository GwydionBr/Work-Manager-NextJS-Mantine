"use server";

import { createClient } from "@/utils/supabase/server";

import { Friend } from "@/stores/userStore";
import { ErrorResponse } from "@/types/action.types";
import { Tables } from "@/types/db.types";


export async function getAllFriends(): Promise<
  | ErrorResponse
  | {
      success: true;
      data: {
        friends: Friend[];
        requestedFriends: Friend[];
        pendingFriends: Friend[];
        declinedFriends: Friend[];
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

  const friendsData = data.map((friendship) =>
    friendship.requester_id === user.id
      ? {
          friendshipId: friendship.id,
          createdAt: friendship.created_at,
          status: friendship.status,
          requester: true,
          profile: friendship.addressee_id,
        }
      : {
          friendshipId: friendship.id,
          createdAt: friendship.created_at,
          status: friendship.status,
          requester: false,
          profile: friendship.requester_id,
        }
  );

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .in(
      "id",
      friendsData.map((friend) => friend.profile)
    );

  if (profilesError) {
    return { success: false, data: null, error: profilesError.message };
  }

  const friends = friendsData
    .filter((friend) => friend.status === "accepted")
    .map((friend) => ({
      friendshipId: friend.friendshipId,
      createdAt: friend.createdAt,
      profile: profiles.find(
        (profile) => profile.id === friend.profile
      ) as Tables<"profiles">,
    }));

  const requestedFriends = friendsData
    .filter((friend) => friend.status === "pending" && !friend.requester)
    .map((friend) => ({
      friendshipId: friend.friendshipId,
      createdAt: friend.createdAt,
      profile: profiles.find(
        (profile) => profile.id === friend.profile
      ) as Tables<"profiles">,
    }));

  const pendingFriends = friendsData
    .filter((friend) => friend.status === "pending" && friend.requester)
    .map((friend) => ({
      friendshipId: friend.friendshipId,
      createdAt: friend.createdAt,
      profile: profiles.find(
        (profile) => profile.id === friend.profile
      ) as Tables<"profiles">,
    }));

  const declinedFriends = friendsData
    .filter((friend) => friend.status === "declined")
    .map((friend) => ({
      friendshipId: friend.friendshipId,
      createdAt: friend.createdAt,
      profile: profiles.find(
        (profile) => profile.id === friend.profile
      ) as Tables<"profiles">,
    }));

  return {
    success: true,
    data: { friends, requestedFriends, pendingFriends, declinedFriends },
    error: null,
  };
}
