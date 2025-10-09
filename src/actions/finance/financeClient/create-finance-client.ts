"use server";

import { createClient } from "@/utils/supabase/server";
import { Tables, TablesInsert } from "@/types/db.types";

export async function createFinanceClient(
  client: TablesInsert<"finance_client">
): Promise<Tables<"finance_client">> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("finance_client")
    .insert({ ...client })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
