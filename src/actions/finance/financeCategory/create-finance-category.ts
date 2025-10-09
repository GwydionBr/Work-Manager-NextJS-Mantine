"use server";

import { createClient } from "@/utils/supabase/server";
import { Tables, TablesInsert } from "@/types/db.types";

export async function createFinanceCategory({
  category,
}: {
  category: TablesInsert<"finance_category">;
}): Promise<Tables<"finance_category">> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("finance_category")
    .insert(category)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
