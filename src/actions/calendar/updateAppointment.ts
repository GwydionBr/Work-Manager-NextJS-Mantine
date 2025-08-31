import { createClient } from "@/utils/supabase/server";
import { ApiResponseSingle } from "@/types/action.types";
import { TablesUpdate } from "@/types/db.types";

export async function updateAppointment(
  appointment: TablesUpdate<"appointment">
): Promise<ApiResponseSingle<"appointment">> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("appointment")
    .update(appointment)
    .eq("id", appointment.id!)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}
