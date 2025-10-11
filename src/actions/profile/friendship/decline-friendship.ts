"use server";

import { createClient } from "@/utils/supabase/server";
import { FriendshipStatusEnum } from "@/types/profile.types";

export async function declineFriendship({
  friendshipId,
}: {
  friendshipId: string;
}): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("friendships")
    .update({ status: FriendshipStatusEnum.DECLINED })
    .eq("id", friendshipId);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}
