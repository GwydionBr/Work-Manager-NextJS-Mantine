"use server";

import { createClient } from "@/utils/supabase/server";
import { ApiResponseSingle } from "@/types/action.types";
import { TablesInsert, Tables } from "@/types/db.types";

export async function createAppointment(
  appointment: TablesInsert<"appointment">
): Promise<ApiResponseSingle<Tables<"appointment">>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("appointment")
    .insert(appointment)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}
