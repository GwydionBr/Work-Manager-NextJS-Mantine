"use server";

import { createClient } from "@/utils/supabase/server";

export async function deleteBankAccounts(ids: string[]): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.from("bank_account").delete().in("id", ids);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}
