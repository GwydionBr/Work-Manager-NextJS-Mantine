"use server";

import { FriendshipStatusEnum, Friend } from "@/types/profile.types";
import { createClient } from "@/utils/supabase/server";

export async function createFriendship({
  profileId,
}: {
  profileId: string;
}): Promise<Friend> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not found");
  }

  const { data, error } = await supabase
    .from("friendships")
    .insert({
      addressee_id: profileId,
      requester_id: user.id,
      status: FriendshipStatusEnum.PENDING,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select()
    .eq("id", profileId)
    .single();

  if (profileError) {
    throw new Error(profileError.message);
  }

  return {
    ...profile,
    friendshipId: data.id,
    friendshipCreatedAt: data.created_at,
    friendshipStatus: data.status,
    isRequester: true,
  };
}
