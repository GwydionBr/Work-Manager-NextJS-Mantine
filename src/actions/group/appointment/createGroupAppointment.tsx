"use server";

import { createClient } from "@/utils/supabase/server";

import { TablesInsert } from "@/types/db.types";
import { ApiResponseSingle } from "@/types/action.types";

export async function createGroupAppointment(
  appointment: TablesInsert<"group_appointment">
): Promise<ApiResponseSingle<"group_appointment">> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("group_appointment")
    .insert(appointment)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return {
    success: true,
    data,
    error: null,
  };
}
