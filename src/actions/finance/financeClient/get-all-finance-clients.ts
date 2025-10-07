"use server";

import { createClient } from "@/utils/supabase/server";

export async function getAllFinanceClients() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("finance_client")
    .select("*")
    .order("name", { ascending: true })
    .throwOnError();

  if (error) throw new Error();

  return data;
}
