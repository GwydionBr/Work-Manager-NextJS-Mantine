"use server";

import { createClient } from "@/utils/supabase/server";

import { Friend } from "@/types/profile.types";

export async function getAllFriends(): Promise<Friend[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not found");
  }

  const { data, error } = await supabase
    .from("friendships")
    .select("*")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

  if (error) {
    throw new Error(error.message);
  }

  const friendsData = data.map((friendship) =>
    friendship.requester_id === user.id
      ? {
          friendshipId: friendship.id,
          friendshipCreatedAt: friendship.created_at,
          friendshipStatus: friendship.status,
          isRequester: true,
          profile: friendship.addressee_id,
        }
      : {
          friendshipId: friendship.id,
          friendshipCreatedAt: friendship.created_at,
          friendshipStatus: friendship.status,
          isRequester: false,
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
    throw new Error(profilesError.message);
  }

  const friends: Friend[] = friendsData
    .map((friend) => {
      const profile = profiles.find((profile) => profile.id === friend.profile);
      if (!profile) return null;
      return {
        ...profile,
        friendshipId: friend.friendshipId,
        friendshipCreatedAt: friend.friendshipCreatedAt,
        friendshipStatus: friend.friendshipStatus,
        isRequester: friend.isRequester,
      };
    })
    .filter((friend): friend is Friend => friend !== null);

  return friends;
}
