"use server";

import { createClient } from "@/utils/supabase/server";
import { Tables } from "@/types/db.types";

export async function getAllPayouts(): Promise<Tables<"payout">[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payout")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
