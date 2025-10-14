"use server";

import { createClient } from "@/utils/supabase/server";
import { TablesInsert, Tables } from "@/types/db.types";

export async function createAppointment(
  appointment: TablesInsert<"appointment">
): Promise<Tables<"appointment">> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("appointment")
    .insert(appointment)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
