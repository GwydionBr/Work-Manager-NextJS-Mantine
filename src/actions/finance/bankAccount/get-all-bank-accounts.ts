"use server";

import { createClient } from "@/utils/supabase/server";
import { Tables } from "@/types/db.types";

export async function getAllBankAccounts(): Promise<Tables<"bank_account">[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bank_account")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
