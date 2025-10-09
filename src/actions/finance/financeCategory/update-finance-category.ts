"use server";

import { createClient } from "@/utils/supabase/server";
import { Tables, TablesUpdate } from "@/types/db.types";

export async function updateFinanceCategory({
  category,
}: {
  category: TablesUpdate<"finance_category">;
}): Promise<Tables<"finance_category">> {
  const supabase = await createClient();

  if (!category.id) {
    throw new Error("Category id is required");
  }

  const { data, error } = await supabase
    .from("finance_category")
    .update(category)
    .eq("id", category.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
