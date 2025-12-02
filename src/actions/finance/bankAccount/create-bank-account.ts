"use server";

import { createClient } from "@/utils/supabase/server";
import { Tables, TablesInsert } from "@/types/db.types";

export async function createBankAccount(bankAccount: TablesInsert<"bank_account">): Promise<Tables<"bank_account">> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bank_account")
    .insert(bankAccount)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}