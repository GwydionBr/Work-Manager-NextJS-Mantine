"use server";

import { createClient } from "@/utils/supabase/server";
import { InsertBankAccount, BankAccount } from "@/types/finance.types";

export async function createBankAccount(
  bankAccount: InsertBankAccount
): Promise<BankAccount> {
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
