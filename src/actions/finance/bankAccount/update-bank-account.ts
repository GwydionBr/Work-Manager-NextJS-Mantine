"use server";

import { createClient } from "@/utils/supabase/server";
import { Tables, TablesUpdate } from "@/types/db.types";

export async function updateBankAccount(
  bankAccount: TablesUpdate<"bank_account">
): Promise<Tables<"bank_account">> {
  if (!bankAccount.id) {
    throw new Error("Bank account id is required");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bank_account")
    .update(bankAccount)
    .eq("id", bankAccount.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
