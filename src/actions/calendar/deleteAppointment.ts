import { createClient } from "@/utils/supabase/server";
import { SimpleResponse } from "@/types/action.types";

export async function deleteAppointment(id: string): Promise<SimpleResponse> {
  const supabase = await createClient();
  const { error } = await supabase.from("appointment").delete().eq("id", id);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}
