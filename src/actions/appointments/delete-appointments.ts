"use server";

import { createClient } from "@/utils/supabase/server";

export async function deleteAppointments(ids: string[]): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.from("appointment").delete().in("id", ids);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}
