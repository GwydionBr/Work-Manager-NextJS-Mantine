"use server";

import { createClient } from "@/utils/supabase/server";
import { Tables, TablesUpdate } from "@/types/db.types";

export async function updateFinanceClient(
  client: TablesUpdate<"finance_client">
): Promise<Tables<"finance_client">> {
  if (!client.id) {
    throw new Error("Client id is required");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("finance_client")
    .update(client)
    .eq("id", client.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
