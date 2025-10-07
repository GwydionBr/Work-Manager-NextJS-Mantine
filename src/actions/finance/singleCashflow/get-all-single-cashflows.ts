"use server";

import { createClient } from "@/utils/supabase/server";
import { SingleCashFlow } from "@/types/finance.types";

export async function getAllSingleCashFlows() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("single_cash_flow")
    .select(
      "*, categories:single_cash_flow_category(finance_category:finance_category_id(*))"
    )
    .order("date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as SingleCashFlow[];
}
