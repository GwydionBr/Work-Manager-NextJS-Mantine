"use server";

import { createClient } from "@/utils/supabase/server";
import { TablesUpdate, Tables } from "@/types/db.types";

export async function updateAppointment(
  appointment: TablesUpdate<"appointment">
): Promise<Tables<"appointment">> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("appointment")
    .update(appointment)
    .eq("id", appointment.id!)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
