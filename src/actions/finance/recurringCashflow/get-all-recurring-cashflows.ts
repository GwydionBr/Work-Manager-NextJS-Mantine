"use server";

import { createClient } from "@/utils/supabase/server";
import { RecurringCashFlow } from "@/types/finance.types";

export async function getAllRecurringCashFlows() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recurring_cash_flow")
    .select(
      "*, categories:recurring_cash_flow_category(finance_category:finance_category_id(*))"
    )
    .order("start_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as RecurringCashFlow[];
}
