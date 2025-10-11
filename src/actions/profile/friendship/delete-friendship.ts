"use server";

import { createClient } from "@/utils/supabase/server";

export async function deleteFriendship({
  friendshipId,
}: {
  friendshipId: string;
}): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId);
    
  if (error) {
    throw new Error(error.message);
  }

  return true;
}
