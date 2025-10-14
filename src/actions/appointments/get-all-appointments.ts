"use server";

import { createClient } from "@/utils/supabase/server";
import { Tables } from "@/types/db.types";

export async function getAllAppointments(): Promise<Tables<"appointment">[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not found");
  }

  const { data, error } = await supabase
    .from("appointment")
    .select("*")
    .eq("user_id", user.id)
    .order("start_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
