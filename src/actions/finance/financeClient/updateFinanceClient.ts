"use server";

import { createClient } from "@/utils/supabase/server";
import { ApiResponseSingle } from "@/types/action.types";
import { TablesUpdate } from "@/types/db.types";

export async function updateFinanceClient(
  client: TablesUpdate<"finance_client">
): Promise<ApiResponseSingle<"finance_client">> {
  if (!client.id) {
    return { success: false, data: null, error: "Client id is required" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("finance_client")
    .update(client)
    .eq("id", client.id)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}
