"use server";

import { createClient } from "@/utils/supabase/server";

export async function deleteFinanceCategories({
  ids,
}: {
  ids: string[];
}): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("finance_category")
    .delete()
    .in("id", ids);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}
