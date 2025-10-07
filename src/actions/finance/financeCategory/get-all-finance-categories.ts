"use server";

import { createClient } from "@/utils/supabase/server";

export async function getAllFinanceCategories(){
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("finance_category")
    .select("*")
    .order("title", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}